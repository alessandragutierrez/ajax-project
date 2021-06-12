/* global genres */

var $viewElements = document.querySelectorAll('.view');
var $navBar = document.querySelector('.nav-bar');
var $spin = document.querySelector('.spin-wheel-button');
var $spinAgain = document.querySelector('.spin-again-button');
var $addButton = document.querySelector('.add-button');
var $filterForm = document.querySelector('.filter-form');
var $movieResultContainer = document.querySelector('.movie-container');
var $watchlistContainer = document.querySelector('.watchlist-container');
var $deleteModal = document.querySelector('.delete-modal');
var movieResultArray = [];
var alreadySeen = [];
var formValues = {};
var currentMovie = {};
var deleteTarget;
var totalPages;
var pageNumber;

window.addEventListener('DOMContentLoaded', handleLoad);
$navBar.addEventListener('click', handleNavClick);
$spin.addEventListener('click', getMovie);
$spinAgain.addEventListener('click', getMoreMovies);
$addButton.addEventListener('click', saveCurrentMovie);
$watchlistContainer.addEventListener('click', openModal);
$deleteModal.addEventListener('click', handleModalClick);

function handleLoad(event) {
  createWatchlistEntries();
  if (data.view !== 'result') {
    swapViews(data.view);
  } else {
    swapViews('home');
  }
  underline(data.view);
  triggerNavViewsAnimations();
}
function handleNavClick(event) {
  swapViews(event.target.getAttribute('data-view'));

  underline(event.target.getAttribute('data-view'));
  clearResult();
  triggerNavViewsAnimations();
}
function getMovie(event) {
  saveFormValues();
  clearForm();
  requestMovie();
  swapViews('result');
  pageNumber = 1;
  alreadySeen = [];
  movieResultAnimation();
}
function getMoreMovies(event) {
  if (!movieResultArray.length > 0) {
    pageNumber++;
    alreadySeen = [];
  }
  if (pageNumber === totalPages) {
    pageNumber = 1;
    alreadySeen = [];
  }
  requestMovie();
  movieResultAnimation();
}
function saveCurrentMovie(event) {
  data.entries.push(currentMovie);
  var newEntry = renderMovie(currentMovie);
  $watchlistContainer.appendChild(newEntry);
  addDeleteIcon(data.entries.length - 1);
  currentMovie = {};
}
function openModal(event) {
  if (event.target.classList.contains('fa-trash') !== true) {
    return;
  }
  $deleteModal.classList.remove('hidden');
  deleteTarget = event.target;
}
function handleModalClick(event) {
  if (event.target.classList.contains('delete-modal') === true ||
    event.target.classList.contains('cancel-button') === true) {
    $deleteModal.classList.add('hidden');
  } else if (event.target.classList.contains('delete-button') === true) {
    deleteEntry();
  }
}

function requestMovie() {
  var xhr = new XMLHttpRequest();
  if (formValues.filterYear !== '' && formValues.filterGenre !== '') {
    xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&primary_release_year=' + formValues.filterYear + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&vote_average.lte=' + formValues.filterRatingMax + '&with_genres=' + formValues.filterGenreId + '&with_watch_monetization_types=flatrate');
  } else if (formValues.filterYear !== '') {
    xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&primary_release_year=' + formValues.filterYear + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&vote_average.lte=' + formValues.filterRatingMax + '&with_watch_monetization_types=flatrate');
  } else if (formValues.filterGenre !== '') {
    xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&vote_average.lte=' + formValues.filterRatingMax + '&with_genres=' + formValues.filterGenreId + '&with_watch_monetization_types=flatrate');
  } else {
    xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=a5e47a4e0a5f7197c6934d0fb4135ec4&language=en-US&include_adult=false&include_video=false&page=' + pageNumber + '&vote_count.gte=50&vote_average.gte=' + formValues.filterRatingMin + '&vote_average.lte=' + formValues.filterRatingMax + '&with_watch_monetization_types=flatrate');
  }
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    totalPages = xhr.response.total_pages;
    movieResultArray = xhr.response.results;
    if (alreadySeen.length > 0) {
      for (var i = 0; i < alreadySeen.length; i++) {
        for (var j = 0; j < movieResultArray.length; j++) {
          if (alreadySeen[i] === movieResultArray[j].id) {
            movieResultArray.splice(j, 1);
          }
        }
      }
    }
    var randomIndex = Math.floor(Math.random() * movieResultArray.length);
    var randomMovie = movieResultArray[randomIndex];
    movieResultArray.splice(randomIndex, 1);
    alreadySeen.push(randomMovie.id);
    storeCurrentMovie(randomMovie);
    var newMovie = renderMovie(randomMovie);
    clearResult();
    $movieResultContainer.prepend(newMovie);
  });
  xhr.send();
}

function renderMovie(movie) {
  var $movie = document.createElement('div');
  $movie.className = 'row center movie';
  $movie.id = movie.id;

  var $imgDiv = document.createElement('div');
  $imgDiv.className = 'column-half img-div';

  var $movieDesc = document.createElement('div');
  $movieDesc.className = 'column-half movie-desc';

  var $img = document.createElement('img');
  $img.className = 'border-radius';
  $img.setAttribute('src', 'https://image.tmdb.org/t/p/original' + movie.poster_path);

  var $movieTitle = document.createElement('h1');
  $movieTitle.className = 'weight-500 padding-bottom';
  $movieTitle.textContent = movie.title;

  var $yearDiv = document.createElement('div');
  $yearDiv.className = 'padding-bottom';
  var $yearLabel = document.createElement('span');
  $yearLabel.className = 'weight-600';
  $yearLabel.textContent = 'Year: ';
  var $yearContent = document.createElement('span');
  $yearContent.textContent = findYear(movie.release_date);

  var $ratingDiv = document.createElement('div');
  $ratingDiv.className = 'padding-bottom';
  var $ratingLabel = document.createElement('span');
  $ratingLabel.className = 'weight-600';
  $ratingLabel.textContent = 'Rating: ';
  var $ratingContent = document.createElement('span');
  $ratingContent.textContent = movie.vote_average;

  var $genreDiv = document.createElement('div');
  $genreDiv.className = 'padding-bottom';
  var $genreLabel = document.createElement('span');
  $genreLabel.className = 'weight-600';
  $genreLabel.textContent = 'Genre: ';
  var $genreContent = document.createElement('span');
  $genreContent.textContent = findGenre(movie.genre_ids);

  var $plotSummary = document.createElement('p');
  $plotSummary.textContent = movie.overview;

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
}
function storeCurrentMovie(movie) {
  currentMovie.id = movie.id;
  currentMovie.poster_path = movie.poster_path;
  currentMovie.title = movie.title;
  currentMovie.release_date = movie.release_date;
  currentMovie.vote_average = movie.vote_average;
  currentMovie.genre_ids = movie.genre_ids;
  currentMovie.overview = movie.overview;
}
function findYear(movie) {
  var year = '';
  for (var i = 0; i < 4; i++) {
    year += movie.charAt(i);
  }
  return year;
}
function findGenre(movie) {
  var movieGenres = '';
  for (var i = 0; i < movie.length - 1; i++) {
    var genreID = movie[i];
    for (var j = 0; j < genres.length; j++) {
      if (genreID === genres[j].id) {
        movieGenres += genres[j].name + '/';
      }
    }
  }
  genreID = movie[movie.length - 1];
  for (var k = 0; k < genres.length; k++) {
    if (genreID === genres[k].id) {
      movieGenres += genres[k].name;
    }
  }
  return movieGenres;
}

function saveFormValues() {
  formValues.filterYear = $filterForm.elements.year.value;
  formValues.filterGenre = $filterForm.elements.genre.value;
  formValues.filterGenreId = findFilterGenre();
  formValues.filterRatingMin = $filterForm.elements.rating.value;
  formValues.filterRatingMax = findMaxRating();
  return formValues;
}
function findFilterGenre() {
  var filterGenre = titleCase($filterForm.elements.genre.value);
  var filterGenreId;
  for (var i = 0; i < genres.length; i++) {
    if (filterGenre === genres[i].name) {
      filterGenreId = genres[i].id;
    }
  }
  return filterGenreId;
}
function titleCase(string) {
  var titleCase = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  if (titleCase.includes('Tv') === true) {
    titleCase = titleCase.replace('Tv', 'TV');
  }
  if (titleCase.indexOf(' ') !== -1) {
    var spaceIndex = titleCase.indexOf(' ');
    var capitalizeSecondWord = '';
    for (var i = 0; i < spaceIndex; i++) {
      capitalizeSecondWord += titleCase.charAt(i);
    }
    capitalizeSecondWord += titleCase.charAt(spaceIndex);
    capitalizeSecondWord += titleCase.charAt(spaceIndex + 1).toUpperCase();
    capitalizeSecondWord += titleCase.slice(spaceIndex + 2);
    titleCase = capitalizeSecondWord;
  }
  return titleCase;
}
function findMaxRating() {
  var minNumber = parseInt(formValues.filterRatingMin);
  var maxNumber = minNumber + 0.9;
  var maxNumberToString = maxNumber.toString();
  return maxNumberToString;
}
function clearForm() {
  $filterForm.elements.year.value = '';
  $filterForm.elements.genre.value = '';
  $filterForm.elements.rating.value = '7';
}

function createWatchlistEntries() {
  for (var i = 0; i < data.entries.length; i++) {
    var newEntry = renderMovie(data.entries[i]);
    $watchlistContainer.appendChild(newEntry);
    addDeleteIcon(i);
  }
}
function addDeleteIcon(i) {
  var $deleteIcon = document.createElement('span');
  $deleteIcon.className = 'fas fa-trash';
  var movieTitleElements = $watchlistContainer.getElementsByTagName('h1');
  movieTitleElements[i].appendChild($deleteIcon);
}
function deleteEntry() {
  var movieTarget = deleteTarget.closest('div.movie');
  var movieTargetID = movieTarget.getAttribute('id');
  for (var i = 0; i < data.entries.length; i++) {
    if (data.entries[i].id === parseInt(movieTargetID)) {
      data.entries.splice(i, 1);
      movieTarget.remove();
    }
  }
  $deleteModal.classList.add('hidden');
}

function underline(target) {
  for (var i = 0; i < $navBar.children.length; i++) {
    if ($navBar.children[i].getAttribute('data-view') !== target) {
      $navBar.children[i].classList.remove('underline');
    } else {
      $navBar.children[i].classList.add('underline');
    }
  }
}

function swapViews(view) {
  for (var i = 0; i < $viewElements.length; i++) {
    if ($viewElements[i].getAttribute('data-view') !== view) {
      $viewElements[i].classList.add('hidden');
    } else {
      $viewElements[i].classList.remove('hidden');
      data.view = view;
    }
  }
}

function clearResult() {
  if ($movieResultContainer.firstElementChild.classList.contains('movie') !== true) {
    return;
  }
  $movieResultContainer.firstElementChild.remove();
}

function triggerNavViewsAnimations() {
  if (data.view === 'home') {
    filterFormAnimation();
  } else if (data.view === 'watchlist') {
    watchListAnimation();
  }
}
function filterFormAnimation() {
  // eslint-disable-next-line no-undef
  gsap.from($filterForm, { duration: 0.5, opacity: 0 });
}
function movieResultAnimation() {
  // eslint-disable-next-line no-undef
  gsap.from($movieResultContainer, { duration: 0.5, scale: 0.97 });
}
function watchListAnimation() {
  // eslint-disable-next-line no-undef
  gsap.from($watchlistContainer, { duration: 0.4, y: 25 });
}
