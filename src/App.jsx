import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";

function App() {
  return (
    <>
      <Header></Header>
      <SearchBar></SearchBar>
      <WeatherCard></WeatherCard>
      <Footer></Footer>
    </>
  );
}

export default App;
