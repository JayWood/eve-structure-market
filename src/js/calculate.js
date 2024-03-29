document.getElementById('fleetForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const formData = document.getElementById('fleetData').value;
    const parsedData = parseFleetData(formData);
    displayResults(parsedData);

    // Calculate the total time from the start and end time fields
    const totalTime = calculateTotalTime(startTime, endTime);
    document.getElementById('totalTime').value = totalTime;
});

// The parseFleetData function remains the same

function calculateTotalTime(startTime, endTime) {
    const startTimestamp = new Date(`1970-01-01T${startTime}`).getTime();
    const endTimestamp = new Date(`1970-01-01T${endTime}`).getTime();
    const finalEnd = endTimestamp < startTimestamp ? new Date(`1970-01-02T${endTime}`).getTime() : endTimestamp;

    if (startTimestamp >= finalEnd) {
        return 0; // If the start time is after or equal to the end time, return 0
    }

    // Calculate the total time in minutes
    const totalTime = (finalEnd - startTimestamp) / (1000 * 60);
    return Math.round(totalTime / 15) * 15; // Round to the nearest 15 minutes
}

function parseFleetData(data) {
    const lines = data.split('\n').filter(i => i);
    const players = {};

    for (const line of lines) {
        const [timestamp, restOfLine] = line.split(' - ');
        const actions = ["joined", "left", "now has"];
        let playerName = null;

        for (const action of actions) {
            if (restOfLine.includes(action)) {
                playerName = restOfLine.split(action)[0].trim();
                break;
            }
        }

        if (playerName) {
            if (!players[playerName]) {
                players[playerName] = {joinTime: null, leaveTime: null};
            }

            if (restOfLine.includes('joined as')) {
                players[playerName].joinTime = timestamp;
            } else if (restOfLine.includes('left fleet')) {
                players[playerName].leaveTime = timestamp;
            }
        }
    }

    return players;
}

function displayResults(players) {
    const tableBody = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    for (const player in players) {
        const {joinTime, leaveTime} = players[player];
        const row = tableBody.insertRow();

        const playerCell = row.insertCell();
        playerCell.textContent = player;

        const joinCell = row.insertCell();
        joinCell.textContent = joinTime || '';

        const leaveCell = row.insertCell();
        leaveCell.textContent = leaveTime || '';

        const timeInGroupCell = row.insertCell();
        if (joinTime && leaveTime) {
            const joinTimestamp = new Date(`1970-01-01T${joinTime}`).getTime();
            const leaveTimestamp = new Date(`1970-01-01T${leaveTime}`).getTime();
            const finalEnd = leaveTimestamp < joinTimestamp ? new Date(`1970-01-02T${leaveTime}`).getTime() : leaveTimestamp;
            const timeInGroup = (finalEnd - joinTimestamp) / (1000 * 60);
            timeInGroupCell.textContent = Math.round(timeInGroup / 15) * 15;
        } else {
            timeInGroupCell.textContent = 'Still in group';
        }
    }
}