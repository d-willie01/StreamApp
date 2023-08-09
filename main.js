
//client is called with CDN in HTML file
let client = AgoraRTC.createClient({mode:'rtc', codec:"vp8"})

//config to join with agora software
//TOKEN expires in a day and a half must 
//generate new one or else there will be an error

let config = 
{
    appId:'', //insert AppID from Agora.io
    token: '', //insert Token generated from Agora.io project
    uid:null,
    channel: 'StreamBoys'
}

//video and audio tracks created to be used to stream
let localTracks = 
{
    audioTrack:null,
    videoTrack: null
}

//sets the state for the mute functions, from true and false
let localTrackState = {
    audioTrackMuted: false,
    videoTrackMuted: false
}

//other users tracks to be streamed
let remoteTracks =
{

}

//function to read when button is clicked in HTML file
document.getElementById("join-btn").addEventListener("click", async() =>{
    console.log("User Joined")

    await joinStreams()
    document.getElementById('join-btn').style.display = "none"
    document.getElementById('footer').style.display = "flex"

})

//this function controls the mute button using the \
//agora function for muting and audio track
document.getElementById('mic-btn').addEventListener("click", async() =>{
    if(!localTrackState.audioTrackMuted) {
        await localTracks.audioTrack.setMuted(true)
        localTrackState.audioTrackMuted = true
        document.getElementById('mic-btn').style.backgroundColor = '#949494'
    }else {
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.getElementById('mic-btn').style.backgroundColor = 'aliceblue'
    }
})

//same function as muted above only mutes the video file
document.getElementById('camera-btn').addEventListener("click", async() =>{
    if(!localTrackState.videoTrackMuted) {
        await localTracks.videoTrack.setMuted(true)
        localTrackState.videoTrackMuted = true
        document.getElementById('camera-btn').style.backgroundColor = '#949494'
    }else {
        await localTracks.videoTrack.setMuted(false)
        localTrackState.videoTrackMuted = false
        document.getElementById('camera-btn').style.backgroundColor = 'aliceblue'
    }
})




document.getElementById("leave-btn").addEventListener("click", async() =>{

    for(trackName in localTracks) {
        let track = localTracks[trackName]
        if(track){
            //stop camera and mic
            track.stop()
            //Disconnects from camera and mic
            track.close()
            localTracks[trackName] = null
        }
    }
    await client.leave()
    document.getElementById('user-streams').innerHTML = ""
    document.getElementById('footer').style.display = "none"
    document.getElementById('join-btn').style.display = "block"
})

//function intiating the user first joining a stream
//and calling the client for the track information
let joinStreams = async() =>{
    
    
    //setting the tracks to be used calling the clients functions
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        client.join(config.appId, config.channel, config.token || null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

        
    ])


    //function that is constantly listening for users
    //that are joining the stream / same channel name
    client.on("user-published", handleUserJoined);
    client.on('user-left', handleUserLeft);

    console.log(config.uid);
    console.log(localTracks);

    //creates a div when a user is published to the screen
    //appends a HTML element to wherever you designate
    let videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid}"> 
                            <p class="user-uid"> ${config.uid} </p>
                            <div class="video-player player" id="stream-${config.uid}"></div>
                        </div>`

                        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
                        localTracks.videoTrack.play(`stream-${config.uid}`)

    await client.publish([localTracks.audioTrack, localTracks.videoTrack])
}
//function to handle when a user leaves the stream
let handleUserLeft = async () => {

    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`)


}

//function created for another user joining stream / same channel name
let handleUserJoined = async(user, mediaType) => {
    console.log("Someones here")

    remoteTracks[user.uid] = user

    await client.subscribe(user, mediaType)

    let videoPlayer = document.getElementById(`video-wrapper-${user.uid}`)
    if(videoPlayer != null)
    {
        videoPlayer.remove()
    }

    if (mediaType === 'video'){
        let videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}"> 
                                <p class="user-uid"> ${user.uid} </p>
                                <div class="video-player player" id="stream-${user.uid}"></div>
                             </div>`
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
        user.videoTrack.play(`stream-${user.uid}`)         
    
        }
    if(mediaType === 'audio') {
        user.audioTrack.play()
    }
              
}