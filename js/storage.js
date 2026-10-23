export function saveTasks(tasks){
    localStorage.setItem("tasks", JSON.stringify(tasks))
}
export function loadTasks(){
    let tasks = []

    try{
       tasks = JSON.parse(localStorage.getItem("tasks")) || []
    }
    catch{
        tasks = []
    }
    if( !Array.isArray(tasks)){
        return []
     }
     return tasks.filter((task)=>
        task !== null &&
        typeof(task) == 'object' &&  
        typeof(task.id) == 'string' && 
        typeof(task.title) == 'string' && 
        task.title.trim().length > 0 && 
        ["Low", "Medium", "High"].includes(task.priority) && 
        typeof(task.completed) == 'boolean' &&
        typeof(task.dueDate) === "string" &&
        typeof(task.category) === "undefined" || ["Personal", "Study", "Work", "Other"].includes(task.category)
    )
}