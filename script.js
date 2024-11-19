let currentSong = new Audio();
let songs;
let currFolder;
let oldVolume;
let oldRange;


function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00'; // Return '00:00' if input is invalid
    }

    // Convert seconds to whole numbers (rounded)
    seconds = Math.round(seconds);

    let minutes = Math.floor(seconds / 60); // Get the minutes part
    let remainingSeconds = seconds % 60; // Get the remaining seconds

    // Format the minutes and seconds to ensure two digits
    minutes = minutes < 10 ? '0' + minutes : minutes;
    remainingSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes}:${remainingSeconds}`;
}

async function getSongs(folder) {
    //get all the songs

    let a = fetch(`http://127.0.0.1:5500/${folder}/`);  // Fetch the URL
    currFolder = folder;
    let response = await a;  // Wait for the fetch to resolve
    let temp = await response.text();  // Call text() as a function to extract the body as text

    let div = document.createElement("div")
    div.innerHTML = temp;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""

    let x = fetch(`http://127.0.0.1:5500/${folder}/info.json`);
    let y = await x;
    let z = await y.json()

    for (const song of songs) {
        let Song_Name = `${song.replaceAll("%20", " ")}`


        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert " src="assets/songIcon.svg" alt="">
                                                    <div class="infoAndPlaynow">
                                                        <div class="info">
                                                            <div class="songname">${Song_Name.split(".mp3")[0]}</div>
                                                            <div class="artistname">${z.artistName}</div>
                                                        </div>
                                                        <div class="playnow">
                                                            <span>Play Now</span>
                                                            <img class="invert" src="assets/playsong.svg" alt="">
                                                        </div>
                                                    </div>
                                                </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML + ".mp3");
        })
    })
    return songs;
}

const playMusic = (track, pause) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "assets/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split(".mp3")[0]
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = fetch(`http://127.0.0.1:5500/songs/`); // Fetch the URL
    let response = await a;
    let result = await response.text();
    let div = document.createElement("div")
    div.innerHTML = result
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/songs/")[1];

            //get the meta data of the folder
            let a = fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a;
            let jsonInfo = await response.json()

            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card ">
                                                <div class="play"><img style="height: 50px; width: 50px;" src="assets/play.svg" alt="df"></div>
                                                <img src="/songs/${folder}/cover.jpg" alt="">
                                                <h2>${jsonInfo.title}</h2>
                                                <p>${jsonInfo.description}</p>
                                            </div>`
        }
    }

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            //item.target:- jaha pe card p click krenge wo milega like image,h2
            //but item.currentTarget:- jispe click evenlisten kr rhe wo milega  
            // console.log(item, item.currentTarget.dataset.folder);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

            //on small screen if we click on playlist then left bar will open automatically
            document.querySelector(".left").style.left = 0
        })
    })
}

async function main() {
    //get all the songs

    //display all the albums on the page
    displayAlbums()
    await getSongs("songs/song_01")
    playMusic(songs[0], true)

    //Attach an event listener to play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assets/playsong2.svg"
        }
    })

    //Listen for timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = currentSong.currentTime / currentSong.duration * 100 + "%"
    })

    //add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    //add an event listener for close(cross) button
    document.querySelector(".cross > img").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-140%"
    })

    //add an event listener for prev button
    document.querySelector("#prev").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (0 <= index - 1) {
            playMusic(songs[index - 1])
        }
    })

    //add an event listener for next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add an event listener for volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.split("/assets/")[1] == "volume.svg") {
            e.target.src = "assets/mute.svg"
            oldVolume = currentSong.volume;
            currentSong.volume = 0;

            oldRange = document.querySelector(".range").getElementsByTagName("input")[0].value;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = "/assets/volume.svg"
            currentSong.volume = oldVolume;
            document.querySelector(".range").getElementsByTagName("input")[0].value = oldRange;
        }
    })
}

main()