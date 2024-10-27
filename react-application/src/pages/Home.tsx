import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-y-5">
      <h1 className="text-4xl font-bold font-mono">
        Advanced Logs System Powered by AI
      </h1>
      <p className="text-xl font-mono">
        Platform to have all the logs in one place.
      </p>
      <div className="flex items-center justify-center gap-x-5">
        <Link to="/logs">
          <Button className="bg-blue-700 hover:bg-blue-500">View Logs</Button>
        </Link>
        <Button>Learn More</Button>
      </div>
      <div className="absolute bottom-0 right-0 w-full p-2 flex justify-end">
        <p className="text-sm text-gray-500 font-mono">
          Made with ❤️ Contributors
          <a href="https://github.com/Majiedo" className="text-blue-500 mx-2">
            Majed
          </a>
          <a
            href="https://github.com/OmarDayili"
            className="text-blue-500 mr-2"
          >
            OmarDayili
          </a>
          <a href="https://github.com/Mo0oj" className="text-blue-500 mr-2">
            Mojahd
          </a>
        </p>
      </div>
    </div>
  );
};

export default Home;
