import { Login } from "./Components/Login";
import Profile from "./Components/Profile";
import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./Components/Dashboard";
import { Rooms } from "./Components/Rooms";
import { Timetable } from "./Components/Timetable";
import { Teacher } from "./Components/Teacher";
// import { Freeslot } from "./Components/Freeslot";
import { First } from "./Components/Firstpage/Firstpage";
import { Classes } from "./Components/Classes";
import { Dashboardhome } from "./Components/DashboadHome";
import { Workload } from "./Components/Workload";
function App() {
  return (
    <>
       <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />}>
        <Route index element={<Dashboardhome/>}/>
        <Route path="classes" element={<Classes/>} />
        {/* <Route path="Freeslot" element={<Freeslot />} /> */}
        <Route path="Rooms" element={<Rooms/>} />
        <Route path="Teacher" element={<Teacher />} />
        <Route path="Timetable" element={<Timetable/>} />
        <Route path="Workload" element={<Workload/>} />
         <Route path="Profile" element={<Profile/>} />
        <Route path="*" element={<Login/>} />
        </Route>
      </Routes> 
    </>
  )
}
export default App;





















