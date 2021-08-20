exports.stringToSeconds = (timeString) => {
    return parseFloat(timeString.split(':')[0])*60 + parseFloat(timeString.split(':')[1]);
}

exports.secondsToString = (timeSeconds) => {
    const mins = Math.floor(timeSeconds / 60);
    let seconds = (timeSeconds % 60).toFixed(1);
    if(seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${mins}:${seconds}`;
}