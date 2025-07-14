export interface Time {
  hh: number;
  mm: number;
  ss: number;
  ms: number;
}

export function getTimeFromStr(time: string): Time {
  const arr = time.split(":");
  const hh = parseInt(arr[0]);
  const mm = parseInt(arr[1]);
  const ss = parseInt(arr[2].split(".")[0]);
  const ms = parseInt(arr[2].split(".")[1]);
  return { hh, mm, ss, ms };
}

export function getStrFromTime(time: Time): string {
  return `${time.hh}:${time.mm}:${time.ss}.${time.ms}`;
}

export function getMsFromTime(time: Time): number {
  return (
    time.hh * 3600000 +
    time.mm * 60000 +
    time.ss * 1000 +
    time.ms
  );
}

export function getTimeFromMs(milliseconds: number): Time {
  const hh = Math.floor(milliseconds / 3600000);
  const mm = Math.floor((milliseconds % 3600000) / 60000);
  const ss = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;
  return { hh, mm, ss, ms };
}

export function getNewTimeStr(timeStr: string, Ms: number): string {
  const timeMs = getMsFromTime(getTimeFromStr(timeStr));
  const newTimeMs = timeMs + Ms;
  return getStrFromTime(getTimeFromMs(newTimeMs));
}
