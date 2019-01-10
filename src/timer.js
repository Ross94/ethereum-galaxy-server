module.exports = () => {
    const initialTime = getTimeInMillis()
    var lastTime = initialTime

    function getTimeInMillis() {
        return Date.now()
    }

    function getExecutionTimeInHMS(start) {
        var hours, minutes, seconds
        seconds = Math.floor((getTimeInMillis() - start) / 1000)
        minutes = Math.floor(seconds / 60)
        seconds = seconds % 60
        hours = Math.floor(minutes / 60)
        minutes = minutes % 60
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        }
    }

    function getTimeFromStart() {
        return getExecutionTimeInHMS(initialTime)
    }

    function getTimeFromLast() {
        const ret = getExecutionTimeInHMS(lastTime)
        lastTime = getTimeInMillis()
        return ret
    }

    function printableHMS(hms) {
        return hms.hours + 'H ' + hms.minutes + 'M ' + hms.seconds + 'S'
    }

    return {
        getTimeFromStart,
        getTimeFromLast,
        printableHMS
    }
}
