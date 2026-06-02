"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackToggle,
  useParticipants,
  useIsSpeaking,
  useRoomContext,
} from "@livekit/components-react";
import { Track, type Participant } from "livekit-client";
import { LogOut, Radio } from "lucide-react";
import { Avatar } from "./avatar";
import { endSpaceAction } from "@/actions/spaces";

type Props = {
  spaceId: string;
  title: string;
  isHost: boolean;
};

type Meta = { username?: string; avatarUrl?: string | null; role?: string };

function parseMeta(p: Participant): Meta {
  try {
    return p.metadata ? (JSON.parse(p.metadata) as Meta) : {};
  } catch {
    return {};
  }
}

export function SpaceRoom({ spaceId, title, isHost }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch(`/api/livekit/token?spaceId=${spaceId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Falha ao conectar");
        return data as { token: string; url: string };
      })
      .then((data) => {
        if (!active) return;
        if (!data.url) {
          setError("NEXT_PUBLIC_LIVEKIT_URL não configurada no .env");
          return;
        }
        setToken(data.token);
        setUrl(data.url);
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [spaceId]);

  if (error)
    return (
      <div className="p-8 text-center text-red-400">
        {error}
        <p className="text-muted text-sm mt-2">
          Confira as chaves do LiveKit no arquivo <code>.env</code> e reinicie o servidor.
        </p>
      </div>
    );

  if (!token) return <div className="p-8 text-center text-muted">Conectando ao áudio…</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      connect
      audio={isHost}
      video={false}
      onDisconnected={() => router.push("/spaces")}
    >
      <RoomAudioRenderer />
      <RoomBody spaceId={spaceId} title={title} isHost={isHost} />
    </LiveKitRoom>
  );
}

function RoomBody({ spaceId, title, isHost }: Props) {
  const participants = useParticipants();
  const room = useRoomContext();

  const speakers = participants.filter((p) => parseMeta(p).role !== "LISTENER");
  const listeners = participants.filter((p) => parseMeta(p).role === "LISTENER");

  return (
    <div className="flex flex-col min-h-[60vh]">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="bg-like text-white text-xs font-bold px-2 py-0.5 rounded">AO VIVO</span>
        <h2 className="font-bold truncate">{title}</h2>
      </div>

      <section className="p-4">
        <h3 className="text-muted text-sm font-semibold mb-3">
          Falando ({speakers.length})
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {speakers.map((p) => (
            <ParticipantTile key={p.identity} participant={p} />
          ))}
        </div>
      </section>

      {listeners.length > 0 && (
        <section className="p-4 border-t border-border">
          <h3 className="text-muted text-sm font-semibold mb-3">
            Ouvintes ({listeners.length})
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
            {listeners.map((p) => (
              <ParticipantTile key={p.identity} participant={p} small />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-auto sticky bottom-0 bg-bg border-t border-border p-4 flex items-center justify-center gap-3">
        {isHost ? (
          <>
            <TrackToggle
              source={Track.Source.Microphone}
              className="flex items-center gap-2 rounded-full px-5 h-11 font-bold bg-panel hover:bg-white/10 transition"
            />
            <form action={endSpaceAction}>
              <input type="hidden" name="id" value={spaceId} />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full px-5 h-11 font-bold bg-red-600 hover:bg-red-700 text-white transition"
              >
                <Radio className="w-5 h-5" /> Encerrar Space
              </button>
            </form>
          </>
        ) : (
          <button
            type="button"
            onClick={() => room.disconnect()}
            className="flex items-center gap-2 rounded-full px-5 h-11 font-bold bg-panel hover:bg-white/10 transition"
          >
            <LogOut className="w-5 h-5" /> Sair do Space
          </button>
        )}
      </footer>
    </div>
  );
}

function ParticipantTile({
  participant,
  small,
}: {
  participant: Participant;
  small?: boolean;
}) {
  const isSpeaking = useIsSpeaking(participant);
  const meta = parseMeta(participant);
  const role = meta.role ?? "LISTENER";
  const size = small ? 48 : 64;

  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div
        className={clsx(
          "rounded-full p-0.5 transition",
          isSpeaking ? "ring-2 ring-accent" : "ring-2 ring-transparent",
        )}
      >
        <Avatar name={participant.name || meta.username || "?"} src={meta.avatarUrl} size={size} />
      </div>
      <span className="text-[13px] font-semibold truncate max-w-[72px]">
        {participant.name || meta.username}
      </span>
      <span className="text-[11px] text-muted">
        {role === "HOST" ? "Host" : role === "SPEAKER" ? "Speaker" : "Ouvinte"}
      </span>
    </div>
  );
}
