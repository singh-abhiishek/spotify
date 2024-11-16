console.log("javascript starts");
let currentSong = new Audio();
let songs;
let currFolder;

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

    let a = fetch(`http://127.0.0.1:5500/${folder}/`);  // Fetch the URL
    currFolder = folder;
    let response = await a;  // Wait for the fetch to resolve
    let temp = await response.text();  // Call text() as a function to extract the body as text
    // console.log(temp);

    let div = document.createElement("div")
    div.innerHTML = temp;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // console.log(songs)
    return songs;
}

const playMusic = (track, pause) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "assets/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main() {
    //get all the songs
    songs = await getSongs("songs/cs")
    playMusic(songs[0], true)
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    // console.log(songUL);

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert " src="assets/songIcon.svg" alt="">
                            <div class="info">
                                <div class="songname">${song.replaceAll("%20", " ")} </div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="assets/playsong.svg" alt="">
                            </div>
                         </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        console.log(e.querySelector(".info").firstElementChild.innerHTML);
        e.addEventListener("click", (elment) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    //Attach an event listener to play, next and prev
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            play.src = "assets/pause.svg"
            currentSong.play()
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
    document.querySelector("#prev").addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/songs/")[1]);
        if(0 <= index-1){
            playMusic(songs[index-1])
        }
    })
    
    //add an event listener for next button
    next.addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/songs/")[1]);
        if(index+1 < songs.length){
            playMusic(songs[index+1])
        }
    })

    //add an event listener for volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) => {
        console.log("setting volume to", e.target.value,"/100");
        currentSong.volume = parseInt(e.target.value)/100
    })

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click",async (item) => {
            //item.target:- jaha pe card p click krenge wo milega like image,h2
            //but item.currentTarget:- jispe click evenlisten kr rhe wo milega
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}
main()