const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const oldSection = `        <div class="categories-grid">
            <div class="category-card">
                <div class="cat-image placeholder-img" data-text="Engine Parts"
                    style="background: url('https://dummyimage.com/400x300/ececec/000000.png&text=Engine') center/cover;">
                </div>
                <div class="cat-content">
                    <h3>Engine Components</h3>
                    <a href="categories.html?category=engine" class="cat-link">View All <i
                            class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
            <div class="category-card">
                <div class="cat-image placeholder-img" data-text="Brakes"
                    style="background: url('https://dummyimage.com/400x300/ececec/000000.png&text=Brakes') center/cover;">
                </div>
                <div class="cat-content">
                    <h3>Brake Systems</h3>
                    <a href="categories.html?category=brakes" class="cat-link">View All <i
                            class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
            <div class="category-card">
                <div class="cat-image placeholder-img" data-text="Suspension"
                    style="background: url('https://dummyimage.com/400x300/ececec/000000.png&text=Suspension') center/cover;">
                </div>
                <div class="cat-content">
                    <h3>Suspension &amp; Steering</h3>
                    <a href="categories.html?category=suspension" class="cat-link">View All <i
                            class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
            <div class="category-card">
                <div class="cat-image placeholder-img" data-text="Electricals"
                    style="background: url('https://dummyimage.com/400x300/ececec/000000.png&text=Electricals') center/cover;">
                </div>
                <div class="cat-content">
                    <h3>Electricals &amp; Lighting</h3>
                    <a href="categories.html?category=electricals" class="cat-link">View All <i
                            class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
        </div>`;

const newSection = `        <div class="categories-grid">
            <div class="category-card">
                <div class="cat-icon" style="--icon-color:#e63900">
                    <i class="fa-solid fa-gears"></i>
                </div>
                <div class="cat-content">
                    <h3>Engine Components</h3>
                    <a href="categories.html?category=engine" class="cat-link">View All <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
            <div class="category-card">
                <div class="cat-icon" style="--icon-color:#c0392b">
                    <i class="fa-solid fa-circle-half-stroke"></i>
                </div>
                <div class="cat-content">
                    <h3>Brake Systems</h3>
                    <a href="categories.html?category=brakes" class="cat-link">View All <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
            <div class="category-card">
                <div class="cat-icon" style="--icon-color:#2980b9">
                    <i class="fa-solid fa-dharmachakra"></i>
                </div>
                <div class="cat-content">
                    <h3>Suspension &amp; Steering</h3>
                    <a href="categories.html?category=suspension" class="cat-link">View All <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
            <div class="category-card">
                <div class="cat-icon" style="--icon-color:#f39c12">
                    <i class="fa-solid fa-car-battery"></i>
                </div>
                <div class="cat-content">
                    <h3>Electricals &amp; Lighting</h3>
                    <a href="categories.html?category=electricals" class="cat-link">View All <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
        </div>`;

// Normalize line endings for matching
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedOld = oldSection.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedOld)) {
    const newContent = normalizedContent.replace(normalizedOld, newSection);
    fs.writeFileSync('index.html', newContent);
    console.log('Categories updated successfully!');
} else {
    // Try a looser match: just replace placeholder img divs individually
    let c = content;
    c = c.replace(/<div class="cat-image placeholder-img" data-text="Engine Parts"[\s\S]*?<\/div>/m, '<div class="cat-icon" style="--icon-color:#e63900"><i class="fa-solid fa-gears"></i></div>');
    c = c.replace(/<div class="cat-image placeholder-img" data-text="Brakes"[\s\S]*?<\/div>/m, '<div class="cat-icon" style="--icon-color:#c0392b"><i class="fa-solid fa-circle-half-stroke"></i></div>');
    c = c.replace(/<div class="cat-image placeholder-img" data-text="Suspension"[\s\S]*?<\/div>/m, '<div class="cat-icon" style="--icon-color:#2980b9"><i class="fa-solid fa-dharmachakra"></i></div>');
    c = c.replace(/<div class="cat-image placeholder-img" data-text="Electricals"[\s\S]*?<\/div>/m, '<div class="cat-icon" style="--icon-color:#f39c12"><i class="fa-solid fa-car-battery"></i></div>');
    fs.writeFileSync('index.html', c);
    console.log('Categories updated via individual replacement!');
}
