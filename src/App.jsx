/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import "./App.css";


const TodoContainer = ({ listID, todo, setToDos }) => {
   const handleToDoStatus = (todoID, status) => {
      setToDos((todo) =>
         todo.filter((item) => {
            if (item.id === todoID) {
               item.status = status;
            }
            return item;
         })
      );
   };

   return (
      <div key={todo.id} className="todo">
         {(listID === "allTask" || listID === "deleted") && (
            <div className="left">
               <i
                  className={`icon fas ${
                     (listID === "allTask" && "fa-check tick") || (listID === "deleted" && "fa-redo-alt retrieve")
                  }`}
                  title={`${(listID === "allTask" && "completed") || (listID === "deleted" && "Retrieve")}`}
                  onClick={() => {
                     if (listID === "allTask") {
                        handleToDoStatus(todo.id, "completed");
                     } else if (listID === "deleted") {
                        let isRetrieve = window.confirm("Retrieving deleted todo ?");
                        if (isRetrieve) handleToDoStatus(todo.id, "allTask");
                     }
                  }}
               ></i>
            </div>
         )}
         <div className="top">
            <p className={`text ${(listID === "completed" || listID === "deleted")}`}>{todo.text}</p>
         </div>
         <div className="bottom">
            <p className="time">{`${todo.moment.time} ${todo.moment.day}`}</p>
            <p className="date">{`${todo.moment.date}`}</p>
         </div>
         {(listID === "completed" || listID === "allTask" || listID === "deleted") && (
            <div className="right">
               <i
                  className={`icon fas ${
                     (listID === "completed" && "fa-trash-alt trash") ||
                     (listID === "allTask" && "fa-times close") ||
                     (listID === "deleted" && "fa-trash-alt trash")
                  }`}
                  title={`${
                     (listID === "completed" && "Remove") ||
                     (listID === "allTask" && "Deleted") ||
                     (listID === "deleted" && "Remove")
                  }`}
                  onClick={() => {
                     if (listID === "completed") {
                        let isRemove = window.confirm("Delete todo permanently ?");
                        if (isRemove) handleToDoStatus(todo.id, "remove");
                     } else if (listID === "allTask") {
                        handleToDoStatus(todo.id, "deleted");
                     } else if (listID === "deleted") {
                        let isRemove = window.confirm("Delete todo permanently ?");
                        if (isRemove) handleToDoStatus(todo.id, "remove");
                     }
                  }}
               ></i>
            </div>
         )}
      </div>
   );
};

function App() {
   const [toDo, setToDo] = useState("");
   const [toDos, setToDos] = useState(() => {
      // #getting stored toDos data from localStorage
      const saved = localStorage.getItem("todo_list_data");
      const initialValue = JSON.parse(saved);
      return initialValue || [];
   });
   // #valid values are <'nav_completed' | 'nav_allTask' | 'nav_deleted'>
   const [bottomNavItemID, setBottomNavItemID] = useState("nav_allTask");
   // #state values for bottomNavBar swipe controls (mobile)
   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);

   // #to get current time in '12hour' format
   const getTime = () => {
      const currDate = new Date();

      const hour = currDate.getHours();
      const minute = currDate.getMinutes();
      const AMorPM = hour >= 12 ? "PM" : "AM";
      // #convert 24hour into 12hour
      let hour_12 = hour % 12;
      if (hour_12 === 0) hour_12 = 12;
      // #convert hour numbers less than 10 into 2 digit number (eg: 5 ==> 05)
      let minute_00 = minute.toString();
      if (minute < 10) minute_00 = `0${minute}`;

      return `${hour_12}:${minute_00} ${AMorPM}`;
   };
   const handleClearTask = () => {
      localStorage.clear();
   };
   // #to get current 'day' of the week
   const getDay = () => {
      const currDate = new Date();
      // #get current day in full letters
      const dayNames_full = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day_full = dayNames_full[currDate.getDay()];
      // #get current day in short letters
      const dayNames_short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day_short = dayNames_short[currDate.getDay()];

      return {
         full: day_full,
         short: day_short,
      };
   };

   // #to get current date in 'MMM DD, YYYY' format
   const getDate = () => {
      const currDate = new Date();
      // #to split into month, dayNum, year array
      const dateSplit = currDate.toString().slice(4, 15).split(" ");

      return `${dateSplit[0]} ${dateSplit[1]}, ${dateSplit[2]}`;
   };

   const handleUserInput = (e) => {
      setToDo(e.target.value);
   };

   const handleInputSubmit = (e) => {
      e.preventDefault();
      if (toDo.split("\n").join("").length > 0) {
         setToDos([
            ...toDos,
            {
               id: Date.now(),
               text: toDo,
               status: "allTask", // #valid values are <'completed' | 'allTask' | 'deleted' | 'remove'>
               moment: {
                  time: getTime(),
                  day: getDay()?.short,
                  date: getDate(),
               },
            },
         ]);
         setToDo("");
         setBottomNavItemID("nav_allTask");
      }
   };
   
   const resetInputField = () => {
      setToDo("");
   };
   const clearAllTask = () => {
      setToDo("");
      setToDos("");
   };

   const handleBottomNavControl = (navItemID) => {
      setBottomNavItemID(navItemID);
   };

   useEffect(() => {
      // #program to removing correspondend toDo from toDos data
      if (toDos) {
         const index = toDos.findIndex((obj) => obj.status === "remove");
         if (index > -1) toDos.splice(index, 1);
      }
      // #storing toDos data to localStorage of browser
      localStorage.setItem("todo_list_data", JSON.stringify(toDos));
   }, [toDos]);

   function handleTouchStart(e) {
      setTouchStart(e.targetTouches[0].clientX);
   }
   function handleTouchMove(e) {
      setTouchEnd(e.targetTouches[0].clientX);
   }

   useEffect(() => {
      // #swipe from right to left ==> touchValue -ve
      // #swipe from left to right ==> touchValue +ve
      const touchValue = touchEnd - touchStart;
      const swipeSensitivity = 150; //#lesser is more sensitivity
      if (touchEnd !== null) {
         if (touchValue > swipeSensitivity) {
            if (bottomNavItemID === "nav_completed") {
               setBottomNavItemID("nav_allTask");
               setTouchStart(touchEnd);
            } else if (bottomNavItemID === "nav_allTask") {
               setBottomNavItemID("nav_deleted");
               setTouchStart(touchEnd);
            }
         }
         if (touchValue < -swipeSensitivity) {
            if (bottomNavItemID === "nav_deleted") {
               setBottomNavItemID("nav_allTask");
               setTouchStart(touchEnd);
            } else if (bottomNavItemID === "nav_allTask") {
               setBottomNavItemID("nav_completed");
               setTouchStart(touchEnd);
            }
         }
      }

      return () => setTouchEnd(null);
   }, [touchEnd, touchStart, bottomNavItemID]);

   return (
      <div className="app">
         {/* heading section */}
         <div className="headings">
            <div className="mainHeading">
               <h1 className="" style={{color: "black"}}>#todo</h1>
            </div>
         </div>
         {/* input section */}
         <form className="inputForm" onSubmit={handleInputSubmit}>
            <div className="input">
               <textarea
                  id="todo-textarea"
                  name="todo-textarea"
                  rows="5"
                  cols="50"
                  value={toDo}
                  onChange={handleUserInput}
                  placeholder="Plan something . . ."
                  autoFocus
                  style={{border: "1px solid black"}}
               />
            </div>
            <div className="input-btns">
               <button className="add-btn" type="submit">
                  <i className="fas fa-plus add" title="Add">  Add</i>
               </button>
               <button className="erase-btn">
                  <i className="fas fa-eraser erase" title="Clear" onClick={resetInputField}>  Clear</i>
               </button>
               <button className="clearAll-btn">
                  <i className="fas fa-solid fa-trash" title="ClearAll" 
                  onClick={() => {
                        
                        let isDeleted = window.confirm("Delete All Task ?");
                        if (isDeleted) clearAllTask();
                        
                  }}
                  >  Delete All Task</i>
               </button>
            </div>
         </form>

         {/* list section */}
         {/* list completed */}
         <div className="list completed" style={{ display: bottomNavItemID === "nav_completed" && "flex" }}>
            <h3 className="heading">Completed Task</h3>
            <div className="toDos">
               {toDos &&
                  toDos.map((todo) => {
                     if (todo.status === "completed") {
                        return (
                           <TodoContainer key={todo.id} listID={todo.status} todo={todo} setToDos={setToDos} />
                        );
                     } else return null;
                  })}
            </div>
         </div>
         {/* list allTask */}
         <div className="list allTask" style={{ display: bottomNavItemID === "nav_allTask" && "flex" }}>
            <h3 className="heading">All Task</h3>
            <div className="toDos">
               {toDos &&
                  toDos.map((todo) => {
                     if (todo.status === "allTask") {
                        return (
                           <TodoContainer key={todo.id} listID={todo.status} todo={todo} setToDos={setToDos} />
                        );
                     } else return null;
                  })}
            </div>
         </div>
         {/* list deleted */}
         <div className="list deleted" style={{ display: bottomNavItemID === "nav_deleted" && "flex" }}>
            <h3 className="heading">Deleted Task</h3>
            <div className="toDos">
               {toDos &&
                  toDos.map((todo) => {
                     if (todo.status === "deleted") {
                        return (
                           <TodoContainer key={todo.id} listID={todo.status} todo={todo} setToDos={setToDos} />
                        );
                     } else return null;
                  })}
            </div>
         </div>
         {/* bottom navBar (mobile) */}
         <div id="bottom_nav" className="bottomNav" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
            <div
               className={`navCompleted ${bottomNavItemID === "nav_completed" && "nav_on"}`}
               onClick={() => handleBottomNavControl("nav_completed")}
            >
               <i className="fas fa-chevron-left icon_sm hidden_icon"></i>
               <i className="fas fa-check icon tick"></i>
               <i className="fas fa-chevron-right icon_sm arrow"></i>
            </div>
            <div
               className={`navAllTask ${bottomNavItemID === "nav_allTask" && "nav_on"}`}
               onClick={() => handleBottomNavControl("nav_allTask")}
            >
               <i className="fas fa-chevron-left icon_sm arrow"></i>
               <i className="far fa-clock icon clock"></i>
               <i className="fas fa-chevron-right icon_sm arrow"></i>
            </div>
            <div
               className={`navDeleted ${bottomNavItemID === "nav_deleted" && "nav_on"}`}
               onClick={() => handleBottomNavControl("nav_deleted")}
            >
               <i className="fas fa-chevron-left icon_sm arrow"></i>
               <i className="fas fa-times icon close"></i>
               <i className="fas fa-chevron-right icon_sm hidden_icon"></i>
            </div>
         </div>
      </div>
   );
}

export default App;
