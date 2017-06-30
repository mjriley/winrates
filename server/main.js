#!/usr/bin/env node

const KindredAPI = require('kindred-api');
const KEY = '1031d40d-6f7c-4f43-b3a8-eb4b86b441f1';
const REGIONS = KindredAPI.REGIONS;
const QUEUES = KindredAPI.QUEUE_TYPES;
const k = KindredAPI.QuickStart(KEY, REGIONS.NORTH_AMERICA, true);

const ACCOUNT_ID = 43517040;

// k.Matchlist
//     .get({
//         accId: BADCAUSE_ACC_ID,
//         options: { queue: QUEUES.TEAM_BUILDER_RANKED_SOLO }
//     })
//     .then(console.log);

const GAME_ID = 2529740246;

function findPlayerTeam(match, accountId) {
    const participantId = match.participantIdentities.find(
        id => id.player.accountId === accountId
    ).participantId;

    const teamId = match.participants.find(
        participant => participant.participantId === participantId
    ).teamId;

    return teamId;
}

function wasMatchVictory(match, accountId) {
    const teamId = findPlayerTeam(match, accountId);

    const team = match.teams.find(team => team.teamId === teamId);

    return team.win === 'Win';
}

function getMatchResult(matchId, accountId) {
    return k.Match
        .get({ id: matchId })
        .then(match => wasMatchVictory(match, ACCOUNT_ID));
}

function getLastXMatchResults(accountId, numMatches) {
    return k.Matchlist
        .get({
            accId: accountId,
            options: {
                queue: QUEUES.TEAM_BUILDER_RANKED_SOLO
            }
        })
        .then(matches => matches.matches.slice(0, numMatches))
        .then(limitedMatches =>
            Promise.all(
                limitedMatches.map(match =>
                    getMatchResult(match.gameId, accountId)
                )
            )
        );
}

// k.Match
//     .get({ id: GAME_ID })
//     .then(match => wasMatchVictory(match, ACCOUNT_ID))
//     .then(wasVictory => console.log('was victory?: ', wasVictory));

getLastXMatchResults(ACCOUNT_ID, 5).then(console.log);
