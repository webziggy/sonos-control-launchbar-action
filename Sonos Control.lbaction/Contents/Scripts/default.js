// Sonos Control - LaunchBar Action
// Author: @webziggy
// v1.0.0
//
// This action requires:
//   1. Hosting of a local Node-Sonos-HTTP-API - https://github.com/jishi/node-sonos-http-api
//   2. Configuration of the serverRoot variable below to point at this.
// When action is invoked it should query the http api for 'zones' and allow find any Sonos Devices (switched on).

// Configuration:

var serverRoot = "http://192.168.86.239:5005/"; // Configure this string to be the URL that hosts your https://github.com/jishi/node-sonos-http-api
var sonosDevices = [];

function run(argument) {
    LaunchBar.debugLog("Runing Sonos Control");
    return main(argument);
}

function main(argument) {

    var founddevices = findSonosDevices();

    if (founddevices)
    {
        var listItems = [];
        for(var i = 0; i < sonosDevices.length; i++) {
            if(isPlayingRadio(sonosDevices[i]) == true) {
                listItems.push({title: ''+sonosDevices[i], action:'controlSonos', actionArgument:''+sonosDevices[i], icon: 'font-awesome:fa-arrow-circle-right', subtitle:'Playing a radio stream', alwaysShowsSubtitle:true, actionReturnsItems:true, actionRunsInBackground: false});
            } else {
                listItems.push({title: ''+sonosDevices[i], action:'controlSonos', actionArgument:''+sonosDevices[i], icon: 'font-awesome:fa-arrow-circle-right', actionReturnsItems:true, actionRunsInBackground: false});
            }
        };
        return listItems;
    }
    else {
        var listItems = [];
            listItems.push({title: 'No Sonos devices found', action:'main', icon: 'font-awesome:redo', actionReturnsItems:true, actionRunsInBackground: false});
        return listItems;
    }
}

function findSonosDevices()
{
    // We'll make the assumption that you only want to control Zones at the top level (so if you have a couple of Sonos grouped together, we'll only let you control the group - but you could adjust this to give the inidividual Sonos devices)
    LaunchBar.debugLog("findSonosDevices started");
    var result = HTTP.getJSON(serverRoot+'zones');
    var jsonobj = result.data;
    LaunchBar.debugLog("findSonosDevices:" +JSON.stringify(jsonobj, undefined, 2));
    for(var i = 0; i < jsonobj.length; i++) {
        var obj = jsonobj[i];
        if (obj.uuid) {
            LaunchBar.debugLog("child:" +JSON.stringify(obj.coordinator, undefined, 2));
            LaunchBar.debugLog("Sonos found: '"+obj.coordinator.roomName+"'");
            sonosDevices.push(obj.coordinator.roomName);
        }
    }
    if (sonosDevices.length > 0) {
        sonosDevices.sort();
        return true;
    }
    return false;
}

function closestNumber (num, arr) {
    var mid;
    var lo = 0;
    var hi = arr.length - 1;
    while (hi - lo > 1) {
        mid = Math.floor ((lo + hi) / 2);
        if (arr[mid] < num) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (num - arr[lo] <= arr[hi] - num) {
        return arr[lo];
    }
    return arr[hi];
}


function getCurrentState(sonosid)
{
    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/state');
    if (result.data != undefined) {
        var currentState = result.data;
        LaunchBar.debugLog(JSON.stringify(currentState, undefined, 2));
        return currentState;
    } else {
        return null;
    }
}

function getCurrentVolume(sonosid)
{
    LaunchBar.debugLog("Finding current volume of: "+sonosid);

    var currentstate = getCurrentState(sonosid);

    if (currentstate != null)
        {
            return currentstate.volume;
        }
    else {
        return "0";
    }
}


function pauseSonos(sonosid)
{
    LaunchBar.displayNotification({string:''+sonosid+' - has been asked to pause', title:"Launchbar: Sonos Control", delay:'0s'});
    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/pause');
    LaunchBar.executeAppleScript('tell application "LaunchBar" to hide');
}

function playpauseSonos(sonosid)
{
    //playpause method seems to not work properly for radio streams.
    LaunchBar.displayNotification({string:''+sonosid+' - has been asked to play/pause toggle', title:"Launchbar: Sonos Control", delay:'0s'});
    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/playpause');
    LaunchBar.executeAppleScript('tell application "LaunchBar" to hide');
}

function togglemuteSonos(sonosid)
{
    LaunchBar.displayNotification({string:''+sonosid+' - has been asked to toggle mute', title:"Launchbar: Sonos Control", delay:'0s'});
    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/togglemute');
    LaunchBar.executeAppleScript('tell application "LaunchBar" to hide');
}

function isPlayingRadio(sonosid)
{
    LaunchBar.debugLog("Checking isPlayingRadio: ");
    var state = getCurrentState(sonosid);
    LaunchBar.debugLog("State for '"+sonosid+"': "+state);
    if (state == null) {
        return false;
    }
    if (state.status == "error") {
        return false;
    }
    if (state.currentTrack.type == "radio" && state.elapsedTimeFormatted == "00:00:00") {
        // Radio is selected but it isn't playing
        returnval = false;
    } else if (state.currentTrack.type == "radio" && state.elapsedTimeFormated != "00:00:00") {
        returnval = true;
    } else {
        returnval = null;
    }
    return returnval;
}

function playSonos(sonosid)
{
    LaunchBar.displayNotification({string:''+sonosid+' - has been asked to play', title:"Launchbar: Sonos Control", delay:'0s'});
    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/play');
    LaunchBar.executeAppleScript('tell application "LaunchBar" to hide');
}

function controlSonos(sonosid)
{
    //sonosid is a string with the 'roomName' from the Sonos API

    var listItems = [];
    listItems.push({title: 'Volume', action:'volumeSelectorSonos', actionArgument:''+sonosid, icon: 'font-awesome:fa-volume-up', actionReturnsItems:true, actionRunsInBackground: false});
    listItems.push({title: 'Pause', action:'pauseSonos', actionArgument:''+sonosid, icon: 'font-awesome:fa-pause', actionReturnsItems:false, actionRunsInBackground: true});
    listItems.push({title: 'Play', action:'playSonos', actionArgument:''+sonosid, icon: 'font-awesome:fa-play', actionReturnsItems:false, actionRunsInBackground: true});
    listItems.push({title: 'Favourites', action:'showFavourites', actionArgument:''+sonosid, icon: 'font-awesome:bookmark', actionReturnsItems:true, actionRunsInBackground: false});
    return listItems;
}




function volumeSelectorSonos(sonosid)
{
    var currentVolume=getCurrentVolume(sonosid);
    var availableVolumes=[5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
    var listItems = [];

    // We should list the current volume first, then list one higher volume then lower volumes - then all the other higher volumes.

    var shownVolumes = [];
    var closestVolume = closestNumber(currentVolume, availableVolumes);
    shownVolumes.push(closestVolume);

    var lowerVolumes = availableVolumes.filter(function(value, index, arr){ return value < closestVolume;});
    var lowerVolumesLength = lowerVolumes.length;
    var higherVolumes = availableVolumes.filter(function(value, index, arr){ return value > closestVolume;});

    var tempval = higherVolumes.shift(); //take the next higher volume
    listItems.push({title: ''+tempval+'%', action:'setVolumeSonos', actionArgument:'["'+tempval+'","'+sonosid+'"]', icon: 'font-awesome:fa-plus-square', actionReturnsItems:false, actionRunsInBackground: true});

    listItems.push({title: ''+currentVolume+'%', action:'togglemuteSonos', actionArgument:''+sonosid, subtitle:'Current Volume (will toggle mute for \''+sonosid+'\' if chosen)', alwaysShowsSubtitle:true, icon: 'font-awesome:fa-check-square', actionReturnsItems:false, actionRunsInBackground: true});

    var lowerVolumesLength = lowerVolumes.length;
    var higherVolumesLength = higherVolumes.length;

    for (var i=lowerVolumesLength-1; i>-1; i--) {
        tempval = lowerVolumes[i];
        listItems.push({title: ''+tempval+'%', action:'setVolumeSonos', actionArgument:'["'+tempval+'","'+sonosid+'"]', icon: 'font-awesome:fa-minus-square', actionReturnsItems:false, actionRunsInBackground: true});
    }

    for (var i=0; i<higherVolumesLength; i++) {
        tempval = higherVolumes[i];
        listItems.push({title: ''+tempval+'%', action:'setVolumeSonos', actionArgument:'["'+tempval+'","'+sonosid+'"]', icon: 'font-awesome:fa-plus-square', actionReturnsItems:false, actionRunsInBackground: true});
    }

    return listItems;
}

//expecting json args ["volumeval","sonosid"]
function setVolumeSonos(jsonargs)
{
    var args = JSON.parse(jsonargs);
    var volumeval=args[0];
    var sonosid=args[1];
    LaunchBar.displayNotification({string:''+sonosid+' - volume set to: '+volumeval+'%', title:"Launchbar: Sonos Control", delay:'0s'});
    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/volume/'+volumeval);
    LaunchBar.executeAppleScript('tell application "LaunchBar" to hide');
}

function showFavourites(sonosid)
{
    LaunchBar.debugLog("Finding Sonos Favourites for "+sonosid);

    var result = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/favorites');
    var listItems = [];
    if (result.data != undefined) {
      if (result.data.status && result.data.status == "error")
      {
        listItems.push({title:'Error retrieving favorites, try again.', icon: 'font-awesome:fa-warning',actionReturnsItems:false});
        LaunchBar.debugLog("Error retrieving favorites: "+ JSON.stringify(result.data, undefined, 2));
      } else {
        //LaunchBar.setClipboardString(result.data);
        var currentFavourites = result.data;
        var copyCurrentFavourites = [];
        //LaunchBar.debugLog(JSON.stringify(currentFavourites, undefined, 2));
        LaunchBar.debugLog('isArray(currentFavourites) = '+Array.isArray(currentFavourites));
//        currentFavourites.forEach(element => copyCurrentFavourites.push(element));
//        LaunchBar.debugLog(copyCurrentFavourites);
        var numresults = currentFavourites.length;
        LaunchBar.debugLog('Number of favourites:' + numresults);

        var debugstring = "Result: ";
        for (i=0; i<numresults; i++)
            {
                debugstring+= ' | #'+i+' - "'+ currentFavourites[i]+'"';
                listItems.push({title: ''+sonosid+' :: '+currentFavourites[i], action:'changeFavourite', actionArgument:'["'+currentFavourites[i]+'","'+sonosid+'"]', icon: 'font-awesome:fa-bookmark', actionReturnsItems:false, actionRunsInBackground: true});
            }
        LaunchBar.debugLog(JSON.stringify(listItems, undefined, 2));
//        LaunchBar.alert('Best match: ' + artist.name, 'The search term was "' + search + '"');
      };
    }

    return listItems;
}

// accepts a JSON string [favouriteItem, sonosid]
function changeFavourite(jsonargs) {
    var args = JSON.parse(jsonargs);
    var favouriteItem=args[0];
    var sonosid=args[1];
    LaunchBar.displayNotification({string:'Sonos Play Favourite: \''+favouriteItem+'\'', title:"LaunchBar: Sonos Favourites", delay:'0s'});
    favouriteItem = encodeURIComponent(favouriteItem);
    var changeResult = HTTP.getJSON(serverRoot+encodeURIComponent(sonosid)+'/favorite/'+favouriteItem);
    LaunchBar.executeAppleScript('tell application "LaunchBar" to hide');
}
