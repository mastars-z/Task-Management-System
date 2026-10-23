import { saveTasks, loadTasks } from "./storage.js";
import { checkTitle } from "./validation.js";
import { createTask, completeTask, deleteTask } from "./task.js";
const addTaskBtn = document.getElementById("add-task-btn");
const taskInput = document.getElementById("task");
const priorityInput = document.getElementById("priority")
const taskContainer = document.getElementById("task-container")
const searchInput = document.getElementById("search")
const [allFilter, completedFilter, pendingFilter] = document.querySelectorAll(".filter")
const statisticsContainer = document.getElementById("statistics")
const taskError = document.getElementById("task-error")
const dueDateInput = document.getElementById("due-date")
const themeToggle = document.getElementById("theme-toggle")
const categoryInput = document.getElementById("category");
const categoryFilter = document.getElementById("category-filter");
let tasks = loadTasks()
let currentFilter = "All"

function updateThemeIcon() {
    const isDarkMode = document.body.classList.contains("dark-mode");

    themeToggle.textContent = isDarkMode ? "☀" : "☾";
    themeToggle.setAttribute(
        "aria-label",
        isDarkMode ? "Switch to light mode" : "Switch to dark mode"
    );
}
themeToggle.addEventListener("click", ()=>{
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    updateThemeIcon();
})
if (localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode")
}
updateThemeIcon()
searchInput.addEventListener("input", ()=>{
    renderTasks(getFilteredTasks())
})
allFilter.addEventListener("click", () => {
    currentFilter = "All";
    updateActiveFilter();
    renderTasks(getFilteredTasks());
})
completedFilter.addEventListener("click", ()=>{
    currentFilter = "Completed";
    updateActiveFilter();
    renderTasks(getFilteredTasks());
})
pendingFilter.addEventListener("click", ()=>{ 
    currentFilter = "Pending";
    updateActiveFilter();
    renderTasks(getFilteredTasks());
})
function renderTasks(taskToRender){
    taskContainer.innerHTML = ""
    for (const  task of taskToRender){
        const taskDiv = document.createElement("div")
        taskDiv.className = "task-card"
        const taskTitle = document.createElement("strong")
        taskTitle.className = "task-title"
        taskTitle.textContent = task.title
        const taskDetails = document.createElement("div");
        taskDetails.className = "task-details"
        const taskMeta = document.createElement("div")
        taskMeta.className = "task-meta"
        const priorityBadge = document.createElement("span")
        priorityBadge.className = `priority-badge priority-${task.priority.toLowerCase()}`
        priorityBadge.textContent = `${task.priority} priority`
        const statusBadge = document.createElement("span")
        statusBadge.className = task.completed? "status-badge status-completed":"status-badge status-pending"
        statusBadge.textContent = task.completed ? "Completed" : "Pending";
        const categoryBadge = document.createElement("span");
        categoryBadge.className = "category-badge";
        categoryBadge.textContent = task.category || "Other";
        taskMeta.append(priorityBadge, statusBadge, categoryBadge);
        taskDetails.append(taskTitle)
        taskDetails.append(taskMeta);
        if(task.dueDate){
            const dueDateLabel = document.createElement("p");
            dueDateLabel.className = "task-due-date";
            const today = new Date();
            const localToday = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, "0"),
                String(today.getDate()).padStart(2, "0")
            ].join("-");
            const isOverdue = task.dueDate < localToday && !task.completed;
            dueDateLabel.textContent = `Due: ${task.dueDate}${
                isOverdue ? " · Overdue" : ""
            }`;
            if (isOverdue) {
                dueDateLabel.classList.add("overdue");
            }
            taskDetails.append(dueDateLabel);
        }
        const completeBtn = document.createElement("button")
        completeBtn.className = "complete-btn"
        const deleteBtn = document.createElement("button")
        deleteBtn.className = "delete-btn"
        deleteBtn.textContent = "Delete"
        completeBtn.textContent = task.completed? "Completed":"Mark Complete";
        completeBtn.disabled = task.completed
        taskDiv.append(taskDetails, completeBtn, deleteBtn)
        completeBtn.addEventListener("click", ()=>{
            completeTask(task)
            saveTasks(tasks)
            renderTasks(getFilteredTasks()); 
            renderStatistics(tasks)
        })
        deleteBtn.addEventListener("click", ()=>{
        tasks = deleteTask(tasks, task.id)
        saveTasks(tasks)
            renderTasks(getFilteredTasks())
            renderStatistics(tasks)
        })
            taskContainer.append(taskDiv)

        }
}
addTaskBtn.addEventListener("click",()=> {
    if (!checkTitle(taskInput.value)){
        taskError.textContent = "Task title is required";
    return;
        
} else{
    taskError.textContent = ""
    const newTask = createTask(taskInput.value.trim(), priorityInput.value,dueDateInput.value,categoryInput.value)
    tasks.push(newTask)
    saveTasks(tasks)
    renderStatistics(tasks)
    renderTasks(getFilteredTasks())
    taskInput.value = ""
    dueDateInput.value = ""
    } 
    }
    )
taskInput.addEventListener("input", ()=> taskError.textContent = "")
function getFilteredTasks(){
        const searchText = searchInput.value.trim().toLowerCase()
        const selectedCategory = categoryFilter.value;
        return tasks.filter((t) =>
        {
            const matchesSearch = t.title.toLowerCase().includes(searchText);
            const matchesStatus = 
            currentFilter === "All" ||
            (currentFilter === "Completed" && t.completed) ||
            (currentFilter === "Pending" && !t.completed);
            const matchCategory = 
            selectedCategory === "All" || 
            (t.category || "Other") === selectedCategory;
            return matchesSearch && matchesStatus && matchCategory
        })
    }
taskInput.addEventListener("keydown", (event)=>{
    if(event.key === "Enter"){
        addTaskBtn.click()
    }
})
categoryFilter.addEventListener("change", () => {
    renderTasks(getFilteredTasks());
});
function updateActiveFilter() {
    [allFilter, completedFilter, pendingFilter].forEach((button) => {
        button.classList.toggle(
            "active",
            button.textContent.trim() === currentFilter
        );
    });
}
function renderStatistics(taskToRender){
    statisticsContainer.textContent  = ""
    const totalTasks = taskToRender.length
    const completedTasks = taskToRender.filter((t) => t.completed).length
    const pendingTasks = taskToRender.filter((t) => !t.completed).length
    const statistics = [
        {label: "Total", value: totalTasks},
        {label: "Completed", value: completedTasks},
        {label: "Pending", value: pendingTasks}
    ]
    for (const statistic of statistics){
        const item = document.createElement("div");
        item.className = "statistic-item"
        const label = document.createElement("span");
        label.textContent = statistic.label;
        const value = document.createElement("strong");
        value.textContent = statistic.value;
        item.append(label,value);
        statisticsContainer.append(item)
    }
}
renderTasks(getFilteredTasks())
renderStatistics(tasks)
updateActiveFilter()
