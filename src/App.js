import { useState } from 'react';
import './App.css';
import Market from './components/Market';
import Navbar from './components/Navbar';
import Home from './components/Home';

function App() {

  const [previousPage, setPreviousPage] = useState(null)
  const [nextPage, setNextPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const navigateToPage = (pageIndex) => {
    if (pageIndex === currentPage) return
    const fromBottom = pageIndex > currentPage

    if (fromBottom)
      setNextPage(pageIndex);
    else
      setPreviousPage(pageIndex);

    setTimeout(() => {
      setCurrentPage(pageIndex);

      if (fromBottom)
        setNextPage(null);
      else
        setPreviousPage(null);
        
    }, 600);
  }

  const pages = [
    <Home />,
    <Market />
  ]

  return (
    <div className="app">
      <Navbar currentlyOn={currentPage} navigate={navigateToPage} />
      <div className="page-container">
        {
          previousPage != null
          ? <div className="page-slidable sliding-in-top">{pages[previousPage]}</div>
          : null
        }
        <div className={`page-slidable ${nextPage != null ? "sliding-out-top" : ""} ${previousPage != null ? "sliding-out-bottom" : ""}`}>
          {pages[currentPage]}
        </div>
        {
          nextPage != null
          ? <div className="page-slidable sliding-in-bottom">{pages[nextPage]}</div>
          : null
        }
      </div>
    </div>
  );
}

export default App;
