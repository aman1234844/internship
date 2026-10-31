const defaultJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechNova",
    category: "Technology",
    mode: "Remote",
    duration: "3 months",
    stipend: 12000,
    description: "Work with our development team to build responsive websites using HTML, CSS and JavaScript.",
    date: "2026-10-20"
  },
  {
    id: 2,
    title: "UI/UX Design Intern",
    company: "Creative Studio",
    category: "Design",
    mode: "Hybrid",
    duration: "2 months",
    stipend: 8000,
    description: "Create user-friendly interfaces, wireframes and prototypes for digital products.",
    date: "2026-10-22"
  },
  {
    id: 3,
    title: "Digital Marketing Intern",
    company: "MarketPro",
    category: "Marketing",
    mode: "Remote",
    duration: "3 months",
    stipend: 10000,
    description: "Help plan social media campaigns, research audiences and analyze marketing performance.",
    date: "2026-10-25"
  },
  {
    id: 4,
    title: "Business Analyst Intern",
    company: "GrowthWorks",
    category: "Business",
    mode: "On-site",
    duration: "6 months",
    stipend: 15000,
    description: "Assist with business research, reporting and data-driven decision-making.",
    date: "2026-10-26"
  },
  {
    id: 5,
    title: "Finance Intern",
    company: "FinEdge",
    category: "Finance",
    mode: "Hybrid",
    duration: "3 months",
    stipend: 9000,
    description: "Support financial reporting, spreadsheet analysis and basic accounting activities.",
    date: "2026-10-27"
  },
  {
    id: 6,
    title: "Web Development Intern",
    company: "CodeCraft",
    category: "Technology",
    mode: "Remote",
    duration: "4 months",
    stipend: 0,
    description: "Learn practical web development by working on real-world practice projects.",
    date: "2026-10-28"
  }
];

// Load saved data from browser storage
function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

let jobs = loadData("internhub_jobs", defaultJobs);
let savedJobs = loadData("internhub_saved", []);
let applications = loadData("internhub_applications", []);
let profile = loadData("internhub_profile", {
  name: "",
  email: "",
  skills: ""
});

function saveData() {
  localStorage.setItem("internhub_jobs", JSON.stringify(jobs));
  localStorage.setItem("internhub_saved", JSON.stringify(savedJobs));
  localStorage.setItem("internhub_applications", JSON.stringify(applications));
  localStorage.setItem("internhub_profile", JSON.stringify(profile));
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}

function updateStats() {
  document.getElementById("totalJobs").textContent = jobs.length;
  document.getElementById("totalApplications").textContent = applications.length;
  document.getElementById("totalSaved").textContent = savedJobs.length;
}

// Display internship cards
function renderJobs() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const mode = document.getElementById("modeFilter").value;
  const stipend = document.getElementById("stipendFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let filtered = jobs.filter(job => {
    const searchable = (
      job.title + " " + job.company + " " +
      job.category + " " + job.description
    ).toLowerCase();

    const matchesSearch = searchable.includes(search);
    const matchesCategory = !category || job.category === category;
    const matchesMode = !mode || job.mode === mode;
    const matchesStipend =
      !stipend ||
      (stipend === "paid" && Number(job.stipend) > 0) ||
      (stipend === "unpaid" && Number(job.stipend) === 0);

    return matchesSearch && matchesCategory &&
      matchesMode && matchesStipend;
  });

  if (sort === "stipend") {
    filtered.sort((a, b) => Number(b.stipend) - Number(a.stipend));
  } else if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const list = document.getElementById("internshipList");
  list.innerHTML = "";

  filtered.forEach(job => {
    const isSaved = savedJobs.includes(job.id);

    const card = document.createElement("article");
    card.className = "job-card";

    card.innerHTML = `
      <div class="job-top">
        <div class="company-icon">${escapeHTML(job.company.charAt(0).toUpperCase())}</div>
        <button class="save-btn ${isSaved ? "saved" : ""}"
          data-save="${job.id}" aria-label="Save internship">
          ${isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div>
        <p class="muted">${escapeHTML(job.company)}</p>
        <h3>${escapeHTML(job.title)}</h3>
      </div>

      <div class="tags">
        <span class="tag">${escapeHTML(job.category)}</span>
        <span class="tag">${escapeHTML(job.mode)}</span>
        <span class="tag">${escapeHTML(job.duration)}</span>
      </div>

      <div class="job-bottom">
        <span class="stipend">
          ${Number(job.stipend) > 0
            ? "₹" + Number(job.stipend).toLocaleString("en-IN") + "/mo"
            : "Unpaid"}
        </span>
        <button class="small-btn" data-details="${job.id}">
          View details
        </button>
      </div>
    `;

    list.appendChild(card);
  });

  document.getElementById("resultCount").textContent =
    `${filtered.length} opportunities found`;

  document.getElementById("emptyMessage")
    .classList.toggle("hidden", filtered.length !== 0);

  updateStats();
}

// Prevent user-entered text from being interpreted as HTML
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

// Save or remove an internship from favourites
function toggleSaved(id) {
  if (savedJobs.includes(id)) {
    savedJobs = savedJobs.filter(item => item !== id);
    toast("Internship removed from saved list");
  } else {
    savedJobs.push(id);
    toast("Internship saved successfully");
  }

  saveData();
  renderJobs();
}

// Show internship details
function showDetails(id) {
  const job = jobs.find(item => item.id === id);
  if (!job) return;

  const dialog = document.getElementById("jobDialog");
  const content = document.getElementById("dialogContent");

  content.innerHTML = `
    <p class="eyebrow">${escapeHTML(job.category)}</p>
    <h2>${escapeHTML(job.title)}</h2>
    <p><strong>Company:</strong> ${escapeHTML(job.company)}</p>
    <p><strong>Work mode:</strong> ${escapeHTML(job.mode)}</p>
    <p><strong>Duration:</strong> ${escapeHTML(job.duration)}</p>
    <p><strong>Stipend:</strong> ${
      Number(job.stipend) > 0
        ? "₹" + Number(job.stipend).toLocaleString("en-IN") + "/month"
        : "Unpaid"
    }</p>
    <p>${escapeHTML(job.description)}</p>
    <button class="primary-btn" id="applyButton">Apply now</button>
  `;

  document.getElementById("applyButton").onclick = () => {
    applyForJob(job.id);
  };

  dialog.showModal();
}

// Apply for an internship
function applyForJob(id) {
  const job = jobs.find(item => item.id === id);
  if (!job) return;

  if (applications.some(app => app.jobId === id)) {
    toast("You have already applied for this internship");
    return;
  }

  if (!profile.name || !profile.email) {
    toast("Please complete your name and email in My Profile first");
    document.getElementById("jobDialog").close();
    document.getElementById("profile").scrollIntoView();
    return;
  }

  applications.push({
    id: Date.now(),
    jobId: id,
    title: job.title,
    company: job.company,
    status: "Under review",
    appliedOn: new Date().toLocaleDateString("en-IN")
  });

  saveData();
  renderApplications();
  updateStats();

  document.getElementById("jobDialog").close();
  toast("Application submitted successfully!");
}

// Display application tracker
function renderApplications() {
  const list = document.getElementById("applicationList");
  list.innerHTML = "";

  if (applications.length === 0) {
    list.innerHTML = `
      <p class="empty">You haven't applied for any internships yet.</p>
    `;
    return;
  }

  applications.forEach(app => {
    const item = document.createElement("article");
    item.className = "application-item";

    item.innerHTML = `
      <div>
        <h3>${escapeHTML(app.title)}</h3>
        <p class="muted">${escapeHTML(app.company)} · Applied ${escapeHTML(app.appliedOn)}</p>
      </div>
      <span class="status">${escapeHTML(app.status)}</span>
    `;

    list.appendChild(item);
  });
}

// Create a new internship listing
document.getElementById("jobForm").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.target;
  const data = new FormData(form);

  const newJob = {
    id: Date.now(),
    title: data.get("title").trim(),
    company: data.get("company").trim(),
    category: data.get("category"),
    mode: data.get("mode"),
    duration: data.get("duration").trim(),
    stipend: Number(data.get("stipend")),
    description: data.get("description").trim(),
    date: new Date().toISOString().slice(0, 10)
  };

  if (!newJob.title || !newJob.company || !newJob.description) {
    toast("Please complete all required fields");
    return;
  }

  jobs.unshift(newJob);
  saveData();
  renderJobs();
  form.reset();

  toast("Internship published successfully!");
  document.getElementById("internships").scrollIntoView();
});

// Profile functions
function loadProfile() {
  document.getElementById("profileName").value = profile.name || "";
  document.getElementById("profileEmail").value = profile.email || "";
  document.getElementById("profileSkills").value = profile.skills || "";
  updateProfileProgress();
}

function updateProfileProgress() {
  const fields = [profile.name, profile.email, profile.skills];
  const completed = fields.filter(value => value && value.trim()).length;
  const percentage = Math.round((completed / fields.length) * 100);

  document.getElementById("profileProgress").style.width =
    percentage + "%";

  document.getElementById("profileCompletion").textContent =
    `Profile completion: ${percentage}%`;
}

document.getElementById("saveProfile").addEventListener("click", () => {
  profile = {
    name: document.getElementById("profileName").value.trim(),
    email: document.getElementById("profileEmail").value.trim(),
    skills: document.getElementById("profileSkills").value.trim()
  };

  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    toast("Please enter a valid email address");
    return;
  }

  saveData();
  updateProfileProgress();
  toast("Profile saved successfully!");
});

// Export applications as CSV
document.getElementById("exportButton").addEventListener("click", () => {
  if (applications.length === 0) {
    toast("There are no applications to export");
    return;
  }

  const headers = ["Internship", "Company", "Status", "Applied On"];

  const rows = applications.map(app => [
    app.title, app.company, app.status, app.appliedOn
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "internhub-applications.csv";
  link.click();

  URL.revokeObjectURL(url);
  toast("CSV export started");
});

// Search and filter events
[
  "searchInput",
  "categoryFilter",
  "modeFilter",
  "stipendFilter",
  "sortFilter"
].forEach(id => {
  document.getElementById(id).addEventListener("input", renderJobs);
});

// Handle internship card buttons
document.getElementById("internshipList").addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  const detailsButton = event.target.closest("[data-details]");

  if (saveButton) {
    toggleSaved(Number(saveButton.dataset.save));
  }

  if (detailsButton) {
    showDetails(Number(detailsButton.dataset.details));
  }
});

// Navigation and dialog
document.getElementById("closeDialog").addEventListener("click", () => {
  document.getElementById("jobDialog").close();
});

document.getElementById("profileButton").addEventListener("click", () => {
  document.getElementById("profile").scrollIntoView({
    behavior: "smooth"
  });
});

// Keyboard shortcut: Ctrl + K focuses the search box
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("searchInput").focus();
  }
});

// Start the application
function init() {
  renderJobs();
  renderApplications();
  loadProfile();
  updateStats();
}

init();