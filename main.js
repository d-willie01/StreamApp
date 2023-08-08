
//client is called with CDN in HTML file
let client = AgoraRTC.createClient({mode:'rtc', codec:"vp8"})

//config to join with agora software
let config = 
{
    appId:'f8d7134048384cd78bac02b439120d8d', 
    token: '007eJxTYLh/4vi1iNdqjrJbW5OPfxc9Nn8eQ7ryzsZoW4OkqCsczHMVGNIsUswNjU0MTCyMLUySU8wtkhKTDYySTIwtDY0MUixSxBdcSmkIZGSoP36NhZEBAkF8LobgkqLUxFyn/MpiBgYAEUAhqg==',
    uid:null,
    channel: 'StreamBoys'
}

//video and audio tracks created to be used to stream
let localTracks = 
{
    audioTrack:null,
    videoTrack: null
}

//other users tracks to be streamed
let remoteTracks =
{

}

//function to read when button is clicked in HTML file
document.getElementById("join-btn").addEventListener("click", async() =>{
    console.log("User Joined")

    await joinStreams()

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
    client.on("user-published", handleUserJoined)

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

//function created for another user joining stream / same channel name
let handleUserJoined = async(user, mediaType) => {
    console.log("Someones here")

    remoteTracks[user.uid] = user

    await client.subscribe(user, mediaType)

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