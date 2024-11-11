import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; 


const firebaseConfig = {
    apiKey: "AIzaSyA3TmhE1invIVB5Lckwam1ZjccdCpPmqUE",
    authDomain: "movie-platform-e9585.firebaseapp.com",
    projectId: "movie-platform-e9585",
    storageBucket: "movie-platform-e9585.firebasestorage.app",
    messagingSenderId: "250431136260",
    appId: "1:250431136260:web:f7bff70d194b8c3f34cb51",
    measurementId: "G-CQD469KZ42"
  };
  


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);


let allMovies = []; 
let currentPage = 1;
const moviesPerPage = 10;

async function loadMovies() {
    try {
        const searchQuery = document.getElementById("searchBar").value.toLowerCase();
        const genre = document.getElementById("genreFilter").value;
        const sortByRating = document.getElementById("ratingSort").value;

      
        let q = collection(db, "movies");

      
        if (searchQuery) {
            q = query(q, where("title", ">=", searchQuery), where("title", "<=", searchQuery + '\uf8ff'));
        }
        if (genre) {
            q = query(q, where("genre", "==", genre));
        }

        const snapshot = await getDocs(q);
        allMovies = snapshot.docs.map(doc => doc.data());


        if (sortByRating) {
            allMovies = allMovies.sort((a, b) => sortByRating === 'asc' ? a.rating - b.rating : b.rating - a.rating);
        }


        renderMovies(allMovies);
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}


function renderMovies(movies) {
    const movieGrid = document.getElementById("movieGrid");
    movieGrid.innerHTML = "";

    const startIndex = (currentPage - 1) * moviesPerPage;
    const paginatedMovies = movies.slice(startIndex, startIndex + moviesPerPage);

    paginatedMovies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <img src="${movie.thumbnail}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Rating: ${movie.rating}</p>
            <p>Release Date: ${movie.releaseDate}</p>
        `;
        movieCard.onclick = () => openModal(movie);
        movieGrid.appendChild(movieCard);
    });

   
    setupPagination(movies.length);
}


function openModal(movie) {
    document.getElementById("movieTitle").textContent = movie.title;
    document.getElementById("movieDescription").textContent = movie.description;
    document.getElementById("movieRating").textContent = movie.rating;
    document.getElementById("movieReleaseDate").textContent = movie.releaseDate;
    document.getElementById("movieModal").style.display = "block";
}


function closeModal() {
    document.getElementById("movieModal").style.display = "none";
}

function setupPagination(totalMovies) {
    const totalPages = Math.ceil(totalMovies / moviesPerPage);
    let paginationHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
    }
    
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = paginationHTML;
}


function changePage(pageNumber) {
    currentPage = pageNumber;
    renderMovies(allMovies);
}


onSnapshot(collection(db, "movies"), (snapshot) => {
    
    allMovies = snapshot.docs.map(doc => doc.data());
    
    renderMovies(allMovies);
});



loadMovies();
