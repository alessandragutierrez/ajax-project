/* global genres */

const $viewElements = document.querySelectorAll('.view');
const $navBar = document.querySelector('.nav-bar');
const $backButton = document.querySelector('.back-button');
const $trailerButton = document.querySelector('.trailer-container');
const $trailerLink = document.querySelector('.trailer-link');
const $spinAgain = document.querySelector('.spin-again-button');
const $addButton = document.querySelector('.add-button');
const $addedButton = document.querySelector('.added-button');
const $filterForm = document.querySelector('.filter-form');
const $ratingLabel = document.querySelector('.rating');
const $movieResultContainer = document.querySelector('.movie-container');
const $watchlistContainer = document.querySelector('.watchlist-container');
const $watchlistEmpty = document.querySelector('.watchlist-empty');
const $watchlistMovies = $watchlistContainer.getElementsByClassName('movie');
const $deleteModal = document.querySelector('.delete-modal');
const $resultLoader = document.querySelector('.result-loader');
const $resultButtons = document.querySelectorAll('.result-button');
const $noResults = document.querySelector('.no-results');
const $tryAgain = document.querySelector('.try-again');
const $networkError = document.querySelector('.network-error');
const formValues = {};
let movieResultArray = [];
let alreadySeen = [];
let currentMovie = {};
let targetMovie;
let totalPages;
let pageNumber;

const handleLoad = event => {
  createWatchlistEntries();
  if (data.view !== 'result') {
    swapViews(data.view);
  } else {
    swapViews('home');
  }
  if (data.entries.length > 0) {
    hideWatchlistEmpty();
  }
  highlight(data.view);
  filterFormAnimation();
};

const handleNavClick = event => {
  if (event.target.classList.contains('nav') !== true) {
    return;
  }
  swapViews(event.target.getAttribute('data-view'));
  highlight(event.target.getAttribute('data-view'));
  if (data.view === 'home') {
    clearForm();
  }
  triggerNavViewsAnimations();
};

const goBack = event => {
  swapViews('home');
  highlight('home');
  $filterForm.elements.year.value = formValues.filterYear;
  $filterForm.elements.genre.value = formValues.filterGenreId;
  $filterForm.elements.rating.value = formValues.filterRatingMin;
  updateLabel(event);
  clearResult();
};

const goBackKeyEvent = event => {
  if (event.key !== 'Backspace' || data.view !== 'result') {
    return;
  }
  goBack(event);
};

const getMovieKeyEvent = event => {
  if (event.key !== 'Enter') {
    return;
  }
  if (data.view === 'home') {
    getMovie(event);
  } else if (data.view === 'result') {
    getMoreMovies(event);
  }
};

const getMovie = event => {
  event.preventDefault();
  hideNoResultsMessage();
  hideNetworkError();
  hideResultButtons();
  hideTrailerButton();
  alreadySeen = [];
  resetAddButton();
  saveFormValues();
  clearForm();
  pageNumber = 1;
  requestMovie();
  swapViews('result');
  $navBar.firstElementChild.classList.remove('highlight');
};

const getMoreMovies = event => {
  if (!movieResultArray.length > 0) {
    pageNumber++;
    alreadySeen = [];
  }
  if (pageNumber === totalPages) {
    pageNumber = 1;
    alreadySeen = [];
  }
  resetAddButton();
  hideTrailerButton();
  requestMovie();
};

const saveCurrentMovie = event => {
  data.entries.push(currentMovie);
  const newEntry = renderMovie(currentMovie, false, true);
  hideWatchlistEmpty();
  $watchlistContainer.appendChild(newEntry);
  currentMovie = {};
  $addButton.classList.add('hidden');
  $addedButton.classList.remove('hidden');
};

const handleWatchlistClick = event => {
  if (event.target.classList.contains('trash-icon') !== true) {
    return;
  }
  targetMovie = event.target.closest('div.movie');
  openModal();
};

const handleModalClick = event => {
  if (event.target.classList.contains('delete-modal') === true ||
    event.target.classList.contains('cancel-button') === true) {
    $deleteModal.classList.add('hidden');
  } else if (event.target.classList.contains('delete-button') === true) {
    deleteEntry(targetMovie);
  }
};

const updateLabel = event => {
  $ratingLabel.textContent = 'Rating ' + ' ( ' + $filterForm.elements.rating.value + ' & up )';
};

const requestMovie = () => {
  showResultLoader();
  const xhr = new XMLHttpRequest();
  let requestUrl = '';
  if (formValues.filterYear !== '' && formValues.filterGenre !== '') {
    requestUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&primary_release_year=' + formValues.filterYear + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&with_genres=' + formValues.filterGenreId + '&with_watch_monetization_types=flatrate';
  } else if (formValues.filterYear !== '') {
    requestUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&primary_release_year=' + formValues.filterYear + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&with_watch_monetization_types=flatrate';
  } else if (formValues.filterGenre !== '') {
    requestUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&with_genres=' + formValues.filterGenreId + '&with_watch_monetization_types=flatrate';
  } else {
    requestUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&with_watch_monetization_types=flatrate';
  }
  xhr.open('GET', requestUrl);
  xhr.responseType = 'json';
  xhr.addEventListener('load', () => {
    totalPages = xhr.response.total_pages;
    movieResultArray = xhr.response.results;
    if (movieResultArray.length === 0) {
      hideResultLoader();
      showNoResultsMessage();
      return;
    }
    if (alreadySeen.length > 0) {
      for (let i = 0; i < alreadySeen.length; i++) {
        for (let j = 0; j < movieResultArray.length; j++) {
          if (alreadySeen[i] === movieResultArray[j].id) {
            movieResultArray.splice(j, 1);
          }
        }
      }
    }
    const randomIndex = Math.floor(Math.random() * movieResultArray.length);
    const randomMovie = movieResultArray[randomIndex];
    movieResultArray.splice(randomIndex, 1);
    alreadySeen.push(randomMovie.id);
    storeCurrentMovie(randomMovie);
    const newMovie = renderMovie(randomMovie, true, false);
    clearResult();
    $movieResultContainer.prepend(newMovie);
    checkIfAdded();
    requestTrailer();
  });
  xhr.addEventListener('error', () => {
    hideResultLoader();
    showNetworkError();
  });
  xhr.send();
};

const requestTrailer = () => {
  const xhr = new XMLHttpRequest();
  const requestURL = 'https://api.themoviedb.org/3/movie/' + data.currentMovieID + '/videos?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US';
  xhr.open('GET', requestURL);
  xhr.responseType = 'json';
  xhr.addEventListener('load', () => {
    if (!xhr.response.results.length > 0) {
      return;
    }
    const videoData = xhr.response.results[0];
    showTrailerButton();
    $trailerLink.setAttribute('href', 'https://www.youtube.com/watch?v=' + videoData.key);
  });
  xhr.send();
};

const renderMovie = (movie, isResult, withDelete) => {
  const $movie = document.createElement('div');
  $movie.className = 'row center movie';
  $movie.id = movie.id;

  const $imgDiv = document.createElement('div');
  $imgDiv.className = 'column-half img-div';

  const $movieDesc = document.createElement('div');
  $movieDesc.className = 'column-half movie-desc';
  $movieDesc.style.wordBreak = 'break-word';

  const $img = document.createElement('img');
  $img.className = 'border-radius';
  $img.setAttribute('src', 'https://image.tmdb.org/t/p/original' + movie.poster_path);

  const $movieTitle = document.createElement('h1');
  $movieTitle.className = 'weight-500 padding-bottom';
  $movieTitle.textContent = movie.title;

  const $yearDiv = document.createElement('div');
  $yearDiv.className = 'padding-bottom';
  const $yearLabel = document.createElement('span');
  $yearLabel.className = 'weight-600';
  $yearLabel.textContent = 'Year: ';
  const $yearContent = document.createElement('span');
  $yearContent.textContent = findYear(movie.release_date);

  const $ratingDiv = document.createElement('div');
  $ratingDiv.className = 'padding-bottom';
  const $ratingLabel = document.createElement('span');
  $ratingLabel.className = 'weight-600';
  $ratingLabel.textContent = 'Rating: ';
  const $ratingContent = document.createElement('span');
  $ratingContent.textContent = movie.vote_average;

  const $genreDiv = document.createElement('div');
  $genreDiv.className = 'padding-bottom';
  const $genreLabel = document.createElement('span');
  $genreLabel.className = 'weight-600';
  $genreLabel.textContent = 'Genre: ';
  const $genreContent = document.createElement('span');
  $genreContent.textContent = findGenre(movie.genre_ids);

  const $plotSummary = document.createElement('p');
  $plotSummary.textContent = movie.overview;

  if (isResult) {
    $movie.classList.add('movie-result');
    hideResultLoader();
    showResultButtons();
  }

  if (withDelete) {
    const $deleteIcon = document.createElement('button');
    $deleteIcon.className = 'fas fa-trash trash-icon button-reset';
    $movieTitle.appendChild($deleteIcon);
  }

  $movie.appendChild($imgDiv);
  $movie.appendChild($movieDesc);
  $imgDiv.appendChild($img);
  $movieDesc.appendChild($movieTitle);
  $movieDesc.appendChild($yearDiv);
  $yearDiv.appendChild($yearLabel);
  $yearDiv.appendChild($yearContent);
  $movieDesc.appendChild($ratingDiv);
  $ratingDiv.appendChild($ratingLabel);
  $ratingDiv.appendChild($ratingContent);
  $movieDesc.appendChild($genreDiv);
  $genreDiv.appendChild($genreLabel);
  $genreDiv.appendChild($genreContent);
  $movieDesc.appendChild($plotSummary);

  return $movie;
};

const storeCurrentMovie = movie => {
  currentMovie.id = movie.id;
  currentMovie.poster_path = movie.poster_path;
  currentMovie.title = movie.title;
  currentMovie.release_date = movie.release_date;
  currentMovie.vote_average = movie.vote_average;
  currentMovie.genre_ids = movie.genre_ids;
  currentMovie.overview = movie.overview;
  data.currentMovieID = movie.id;
};

const findYear = movie => {
  let year = '';
  for (let i = 0; i < 4; i++) {
    year += movie.charAt(i);
  }
  return year;
};

const findGenre = movie => {
  let movieGenres = '';
  for (let i = 0; i < movie.length - 1; i++) {
    const genreID = movie[i];
    for (let j = 0; j < genres.length; j++) {
      if (genreID === genres[j].id) {
        movieGenres += genres[j].name + '/';
      }
    }
  }
  const genreID = movie[movie.length - 1];
  for (let k = 0; k < genres.length; k++) {
    if (genreID === genres[k].id) {
      movieGenres += genres[k].name;
    }
  }
  return movieGenres;
};

const saveFormValues = () => {
  formValues.filterYear = $filterForm.elements.year.value;
  formValues.filterGenreId = $filterForm.elements.genre.value;
  formValues.filterRatingMin = $filterForm.elements.rating.value;
  return formValues;
};

const clearForm = () => {
  $filterForm.elements.year.value = '';
  $filterForm.elements.genre.value = '';
  $filterForm.elements.rating.value = '0';
  $ratingLabel.textContent = 'Rating';
};

const checkIfAdded = () => {
  for (let i = 0; i < data.entries.length; i++) {
    if (data.entries[i].id === currentMovie.id) {
      $addButton.classList.add('hidden');
      $addedButton.classList.remove('hidden');
    }
  }
};

const resetAddButton = () => {
  $addButton.classList.remove('hidden');
  $addedButton.classList.add('hidden');
};

const createWatchlistEntries = () => {
  for (let i = 0; i < data.entries.length; i++) {
    const newEntry = renderMovie(data.entries[i], false, true);
    $watchlistContainer.appendChild(newEntry);
  }
};

const openModal = () => {
  $deleteModal.classList.remove('hidden');
};

const deleteEntry = targetMovie => {
  let i;
  if (data.view === 'watchlist') {
    for (i = 0; i < data.entries.length; i++) {
      if (data.entries[i].id === parseInt(targetMovie.getAttribute('id'))) {
        data.entries.splice(i, 1);
        targetMovie.remove();
      }
    }
  } else if (data.view === 'result') {
    for (i = 0; i < $watchlistMovies.length; i++) {
      if (parseInt($watchlistMovies[i].id) === data.currentMovieID) {
        targetMovie = $watchlistMovies[i];
        targetMovie.remove();
        currentMovie = data.entries[i];
        data.entries.splice(i, 1);
      }
    }
    resetAddButton();
  }
  if (!data.entries.length) {
    $watchlistEmpty.classList.remove('hidden');
  }
  $deleteModal.classList.add('hidden');
};

const highlight = target => {
  for (let i = 0; i < $navBar.children.length; i++) {
    if ($navBar.children[i].getAttribute('data-view') !== target) {
      $navBar.children[i].classList.remove('highlight');
    } else {
      $navBar.children[i].classList.add('highlight');
    }
  }
};

const swapViews = view => {
  for (let i = 0; i < $viewElements.length; i++) {
    if ($viewElements[i].getAttribute('data-view') !== view) {
      $viewElements[i].classList.add('hidden');
    } else {
      $viewElements[i].classList.remove('hidden');
      data.view = view;
    }
  }
};

const hideWatchlistEmpty = () => {
  $watchlistEmpty.classList.add('hidden');
};

const clearResult = () => {
  if ($movieResultContainer.firstElementChild.classList.contains('movie') !== true) {
    return;
  }
  $movieResultContainer.firstElementChild.remove();
};

const showResultLoader = () => {
  $resultLoader.classList.remove('hidden');
};

const hideResultLoader = () => {
  $resultLoader.classList.add('hidden');
};

const showResultButtons = () => {
  for (let i = 0; i < $resultButtons.length; i++) {
    $resultButtons[i].classList.remove('hidden');
  }
};

const hideResultButtons = () => {
  for (let i = 0; i < $resultButtons.length; i++) {
    $resultButtons[i].classList.add('hidden');
  }
};

const showTrailerButton = () => {
  $trailerButton.classList.remove('hidden');
};

const hideTrailerButton = () => {
  $trailerButton.classList.add('hidden');
};

const showNoResultsMessage = () => {
  $noResults.classList.remove('hidden');
};

const hideNoResultsMessage = () => {
  $noResults.classList.add('hidden');
};

const showNetworkError = () => {
  $networkError.classList.remove('hidden');
};

const hideNetworkError = () => {
  $networkError.classList.add('hidden');
};

const triggerNavViewsAnimations = () => {
  if (data.view === 'home') {
    filterFormAnimation();
  } else if (data.view === 'watchlist') {
    watchListAnimation();
  }
};
const filterFormAnimation = () => {
  // eslint-disable-next-line no-undef
  gsap.from($filterForm, { duration: 0.5, opacity: 0 });
};
const watchListAnimation = () => {
  // eslint-disable-next-line no-undef
  gsap.from($watchlistContainer, { duration: 0.5, y: 30 });
};

window.addEventListener('DOMContentLoaded', handleLoad);
$navBar.addEventListener('click', handleNavClick);
$backButton.addEventListener('click', goBack);
document.addEventListener('keydown', goBackKeyEvent);
$filterForm.addEventListener('submit', getMovie);
document.addEventListener('keydown', getMovieKeyEvent);
$spinAgain.addEventListener('click', getMoreMovies);
$addButton.addEventListener('click', saveCurrentMovie);
$addedButton.addEventListener('click', openModal);
$watchlistContainer.addEventListener('click', handleWatchlistClick);
$deleteModal.addEventListener('click', handleModalClick);
$filterForm.elements.rating.addEventListener('input', updateLabel);
$tryAgain.addEventListener('click', goBack);
