import dynamic from "next/dynamic";

const App = dynamic(() => import("./index"), { ssr: false });

export default App;
