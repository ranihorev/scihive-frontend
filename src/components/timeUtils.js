function getTimePassed(cur_time) {
  var t = Math.max(Date.parse(new Date()) - Date.parse(cur_time), 1);
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

export default function get_age(utc_time) {
  const post_time = new Date(utc_time);
  // const post_time_local = new Date(post_time.valueOf() - post_time.getTimezoneOffset() * 60000);
  let time_passed = getTimePassed(post_time);
  if (time_passed.days === 0) {
    if (time_passed.hours  >= 1) {
      return time_passed.hours + "h";
    }
    else {
      return time_passed.minutes + "m";
    }
  }
  else if (time_passed.days <= 14) {
    return time_passed.days + "d";
  }
  else {
    return post_time.toLocaleDateString();
  }
}