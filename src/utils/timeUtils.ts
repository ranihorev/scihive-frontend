function getTimePassed(time: Date) {
  const curTime = new Date();
  const t = Math.max(Number(curTime) - Number(time), 1);
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    total: t,
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function getAge(utc_time: string) {
  const post_time = new Date(utc_time);
  // const post_time_local = new Date(post_time.valueOf() - post_time.getTimezoneOffset() * 60000);
  const time_passed = getTimePassed(post_time);
  if (time_passed.days === 0) {
    if (time_passed.hours >= 1) {
      return `${time_passed.hours}h`;
    }
    return `${time_passed.minutes}m`;
  }
  if (time_passed.days <= 14) {
    return `${time_passed.days}d`;
  }
  return post_time.toLocaleDateString();
}
