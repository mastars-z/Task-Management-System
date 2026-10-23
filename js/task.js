export function createTask(title, priority, dueDate = "", category = "Other"){
    const task = {
        id: crypto.randomUUID(),
        title,
        priority,
        dueDate,
        category,
        completed: false
    }
    return task;
}
export function completeTask(task){
    task.completed = true;
} 
export function deleteTask(tasks, taskId){
    return tasks.filter((t)=>t.id !== taskId)
}