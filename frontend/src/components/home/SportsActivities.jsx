import SportsActivitiesSnow from "../../assets/home/SportsActivities-snow.svg"
import SportsActivitiesTenis from "../../assets/home/SportsActivities-tenis.svg"
import SportsActivitiesVolleybal from "../../assets/home/SportsActivities-volleybal.svg"


function SportActivities(){
    return(
        <>
            <div className="flex mt-[3%] gap-x-2">
                <div className="cursor-pointer transform transition-transform hover:scale-95">
                    <img src={SportsActivitiesSnow} alt="Snowing sport" className="w-full h-full object-cover transition duration-300 ease-in-out" />
                </div>
                <div className="cursor-pointer transform transition-transform hover:scale-95">
                    <img src={SportsActivitiesTenis} alt="Playing tenis" className="w-full h-full object-cover transition duration-300 ease-in-out" />
                </div>
                <div className="cursor-pointer transform transition-transform hover:scale-95">
                    <img src={SportsActivitiesVolleybal} alt="Playing wolleybal" className="w-full h-full object-cover transition duration-300 ease-in-out" />
                </div>
            </div>
        </>
    )
}
export default SportActivities;