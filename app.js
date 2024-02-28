const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//select players

app.get("/players/", async (request, response) => {
  const cricketTeamQuery = `
        SELECT 
            *
        FROM
            cricket_team
        ORDER BY
            player_id`;
  const teamArray = await db.all(cricketTeamQuery);
  response.send(teamArray);
});
//add player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const playerQuery = `
        INSERT INTO
            cricket_team (player_id, player_name, jersey_number, role)
        VALUES
            (
             ${player_id},
             '${player_name}',
             ${jersey_number},
             '${role}',

            );`;
  const dbResponse = await db.run(playerQuery);
  const cricketId = dbResponse.lastId;
  response.send("Player Added to Team");
});

// Add get API

app.get("/players/:playerId/", async (request, response) => {
  const { player_id } = request.params;
  const getCriketQuery = `
        SELECT
            *
        FROM
            cricket_team
        WHERE
            player_id = ${player_id}`;
  const player = await db.get(getCriketQuery);
  response.send(player);
});

//Add put API
app.put("/players/:playerId/", async (request, response) => {
  const { player_id } = request.params;
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updatePlayerQuery = `
        update
            player
        SET
            player_id = ${player_id},
            player_name = '${player_name}',
            jersey_number = ${jersey_number},
            role = '${role}'
        WHERE
            player_id = ${player_id};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//ADD Delete API
app.delete("/players/:playerId", async (request, response) => {
  const { player_id } = request.params;
  const deletePlayerQuery = `
        DELETE FROM
            player
        WHERE
            player_id = ${player_id};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
