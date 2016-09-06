# KB Shuttle Bus API
####[Demo](http://bustracker-api.rentawolf.com/potterow)
API providing next bus times for the [University of Edinburgh King's Buildings Shuttle Bus](http://www.ed.ac.uk/transport/public-transport/buses/shuttle-bus)

Returns information on the Edinburgh University Shuttle Contract with Lothian Buses (Service C134) as well as Service 41 operating on a similar route and using the same bus stops. There are [additional services](http://www.ed.ac.uk/transport/travelling-here/kings-buildings/by-bus) stopping on Mayfield Road and West Mains Road, which are not returned by the API.

NB: From 2016-17, the Shuttle Bus is an Express service between Potterow and KB and does not pick up in the Central Area near Summerhall.

### Supported routes
* /potterow - Returns Edinburgh Uni Shuttle departures from Potterow to Kings Buildings
* /meadows - Returns Service 41 departures from Giffords Park to Kings Buildings
* /kb - Returns Edinburgh Uni Shuttle and Service 41 departures from the Roger Land Building at Kings Buildings to Central