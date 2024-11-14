console.log("javascript starts");
let currentSong = new Audio();

async function getSongs() {

    let a = fetch("http://127.0.0.1:5500/songs/");  // Fetch the URL
    let response = await a;  // Wait for the fetch to resolve
    let temp = await response.text();  // Call text() as a function to extract the body as text
    // console.log(temp);

    let div = document.createElement("div")
    div.innerHTML = temp;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split("/songs/")[1])
        }
    }
    // console.log(songs)
    return songs;
}

const playMusic = (track) => {
    // let audio = new Audio("/songs/" + track) 
    currentSong.src = "/songs/" + track
    currentSong.play()
}

async function main() {
    //get all the songs
    let songs = await getSongs()
    console.log(songs);

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    // console.log(songUL);

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert " src="assets/songIcon.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
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
}
main()