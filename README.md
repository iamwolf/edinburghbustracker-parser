#edinburghbustracker API
####[Demo](bustracker-api.rentawolf.com/potterow)
~~Quick'n'dirty app to parse data from the mobile website of mybustracker.co.uk until I receive access to the official API.~~
Parser deactivated since classes and structure changes frequently. Now operating using official API key and preparing data for mobile app. Raw API key has to be set using environment variables.

Currently used to return information on the Edinburgh University Shuttle Contract with Lothian Buses (Service C134) as well as Service 41 operating on a similar route and using the same bus stops.

###Supported routes
~~* /mock-official-api - Returns sample output for testing purposes~~
* /potterow - Returns Edinburgh Uni Shuttle departures from Potterow to Kings Buildings
* /meadows - Returns Edinburgh Uni Shuttle departures from Giffords Park to Kings Buildings
* /kb - Returns Edinburgh Uni Shuttle departures from the Roger Land Building at Kings Buildings to Central