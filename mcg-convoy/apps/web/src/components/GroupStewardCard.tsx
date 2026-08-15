"use client";

import { FormEvent, useState } from "react";
import { Bell, ChatTeardrop, Copy, Hash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { routeBriefing } from "@/lib/briefing";
import { meetingPointLabel } from "@/lib/convoy-roles";
import { tapHaptic } from "@/lib/haptic";
import { useLocale } from "@/lib/i18n/locale";
import { shareTripInvite } from "@/lib/liff";
import {
  buildBriefFlex,
  buildRemindFlex,
  buildStatusFlex,
} from "@/lib/line-flex";
import { getReminder, scheduleT30 } from "@/lib/reminders";
import { parseWake, WAKE_PHRASE } from "@/lib/wake";
import type { Trip } from "@/lib/types";
import ui from "@/styles/ui.module.css";

type Props = {
  trip: Trip;
  liveUrl: string;
  lobbyUrl: string;
  sharingCount: number;
};

export function GroupStewardCard({
  trip,
  liveUrl,
  lobbyUrl,
  sharingCount,
}: Props) {
  const { t, locale, formatTime } = useLocale();
  const [wake, setWake] = useState("");
  const [armed, setArmed] = useState(() => getReminder(trip.id));
  const lead = trip.participants.find((p) => p.role === "organizer");
  const leadLive = lead?.sharingState === "sharing";
  const briefing = routeBriefing(trip, locale);
  const meeting = meetingPointLabel(trip) || trip.destinationName;

  const statusFlex = buildStatusFlex({
    url: liveUrl,
    title: trip.title,
    liveCount: sharingCount,
    total: trip.participants.length,
    leadLive,
    locale,
  });
  const briefFlex = buildBriefFlex({
    url: lobbyUrl,
    title: trip.title,
    meeting,
    destination: trip.destinationName,
    toll: briefing.toll,
    locale,
  });
  const remindFlex = buildRemindFlex({
    url: lobbyUrl,
    title: trip.title,
    timeLabel: formatTime(trip.targetArrivalAt),
    locale,
  });

  const replyFor = (kind: ReturnType<typeof parseWake>) => {
    if (kind === "status") {
      return t.steward.previewStatus
        .replace("{live}", String(sharingCount))
        .replace("{total}", String(trip.participants.length))
        .replace("{lead}", leadLive ? t.steward.leadLive : t.steward.leadOff);
    }
    if (kind === "brief") return t.steward.previewBrief.replace("{toll}", briefing.toll);
    if (kind === "remind") return t.steward.previewRemind;
    if (kind === "share") return t.steward.statusShared;
    if (kind === "help") return t.steward.previewHelp;
    return t.lobby.wakeUnknown;
  };

  const preview = (kind: "status" | "brief" | "remind") => {
    tapHaptic();
    toast.message(replyFor(kind));
  };

  const onWake = (e: FormEvent) => {
    e.preventDefault();
    const kind = parseWake(wake);
    tapHaptic();
    toast.message(replyFor(kind));
    if (kind === "share") void shareTripInvite(liveUrl, statusFlex.altText, statusFlex);
    if (kind === "brief") void shareTripInvite(lobbyUrl, briefFlex.altText, briefFlex);
    if (kind === "remind") void shareTripInvite(lobbyUrl, remindFlex.altText, remindFlex);
    if (kind === "status") void shareTripInvite(liveUrl, statusFlex.altText, statusFlex);
    setWake("");
  };

  const copyWake = async () => {
    await navigator.clipboard.writeText(WAKE_PHRASE);
    tapHaptic();
    toast.success(t.steward.copiedWake);
  };

  const shareStatus = async () => {
    await shareTripInvite(liveUrl, statusFlex.altText, statusFlex);
    tapHaptic();
    toast(t.steward.statusShared);
  };

  const shareBrief = async () => {
    await shareTripInvite(lobbyUrl, briefFlex.altText, briefFlex);
    tapHaptic();
    toast(t.steward.briefShared);
  };

  const armRemind = async () => {
    const next = scheduleT30(trip.id, trip.targetArrivalAt);
    setArmed(next);
    await shareTripInvite(lobbyUrl, remindFlex.altText, remindFlex);
    tapHaptic();
    toast.success(
      t.lobby.remindArmed.replace("{time}", formatTime(next.fireAt)),
    );
  };

  return (
    <section className={ui.section}>
      <h2>{t.steward.title}</h2>
      <p className={ui.lede}>{t.steward.lede}</p>
      <div className={ui.flexCard}>
        <p className={ui.flexBrand}>LINE GROUP</p>
        <p className={ui.flexTitle}>{t.steward.inviteGroup}</p>
        <p className={ui.meta}>{t.steward.privacy}</p>
        <ol className={ui.wakeList}>
          <li>
            <button type="button" onClick={() => preview("status")}>
              <Hash size={16} /> {t.steward.cmdStatus}
            </button>
          </li>
          <li>
            <button type="button" onClick={() => preview("brief")}>
              <ChatTeardrop size={16} /> {t.steward.cmdBrief}
            </button>
          </li>
          <li>
            <button type="button" onClick={() => preview("remind")}>
              <Bell size={16} /> {t.steward.cmdRemind}
            </button>
          </li>
        </ol>
        <form className={ui.wakeForm} onSubmit={onWake}>
          <label className="sr-only" htmlFor="wake">
            {t.lobby.wakeHint}
          </label>
          <input
            id="wake"
            value={wake}
            onChange={(e) => setWake(e.target.value)}
            placeholder={t.lobby.wakePlaceholder}
            autoComplete="off"
          />
          <button type="submit" className={ui.btnGhost}>
            {WAKE_PHRASE}
          </button>
        </form>
        <p className={ui.meta}>{t.lobby.wakeHint}</p>
        {armed ? (
          <p className={ui.meta}>
            {t.lobby.remindArmed.replace("{time}", formatTime(armed.fireAt))}
          </p>
        ) : null}
        <div className={ui.row}>
          <button type="button" className={ui.btnPrimary} onClick={() => void shareStatus()}>
            {t.steward.shareStatus}
          </button>
          <button type="button" className={ui.btnGhost} onClick={() => void shareBrief()}>
            {t.steward.shareBrief}
          </button>
          <button type="button" className={ui.btnGhost} onClick={() => void armRemind()}>
            {t.steward.shareRemind}
          </button>
          <button type="button" className={ui.btnGhost} onClick={() => void copyWake()}>
            <Copy size={16} />
            {WAKE_PHRASE}
          </button>
        </div>
      </div>
    </section>
  );
}
