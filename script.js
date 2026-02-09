class BirthdayReminder {
    constructor() {
        this.birthdays = this.loadBirthdays();
        this.form = document.getElementById('birthdayForm');
        this.birthdaysList = document.getElementById('birthdaysList');
        this.totalCount = document.getElementById('totalCount');
        this.upcomingCount = document.getElementById('upcomingCount');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.renderBirthdays();
        this.updateStats();
    }

    loadBirthdays() {
        const stored = localStorage.getItem('birthdays');
        return stored ? JSON.parse(stored) : [];
    }

    saveBirthdays() {
        localStorage.setItem('birthdays', JSON.stringify(this.birthdays));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const date = document.getElementById('date').value;
        
        if (!name || !date) {
            return;
        }

        const birthday = {
            id: Date.now().toString(),
            name: name,
            date: date,
            createdAt: new Date().toISOString()
        };

        this.birthdays.push(birthday);
        this.saveBirthdays();
        this.renderBirthdays();
        this.updateStats();
        
        this.form.reset();
        document.getElementById('name').focus();
    }

    deleteBirthday(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet anniversaire ?')) {
            this.birthdays = this.birthdays.filter(b => b.id !== id);
            this.saveBirthdays();
            this.renderBirthdays();
            this.updateStats();
        }
    }

    calculateDaysUntilBirthday(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const birthday = new Date(dateString);
        const currentYear = today.getFullYear();
        
        let nextBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());
        
        if (nextBirthday < today) {
            nextBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
        }
        
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    formatBirthdayDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    getBirthdayStatus(daysUntil) {
        if (daysUntil === 0) {
            return {
                class: 'today',
                text: "Aujourd'hui ! ",
                countdownClass: 'countdown-today'
            };
        } else if (daysUntil <= 7) {
            return {
                class: 'upcoming',
                text: `Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''} `,
                countdownClass: 'countdown-soon'
            };
        } else {
            return {
                class: '',
                text: `Dans ${daysUntil} jours`,
                countdownClass: 'countdown-normal'
            };
        }
    }

    sortBirthdaysByDate() {
        return [...this.birthdays].sort((a, b) => {
            const daysA = this.calculateDaysUntilBirthday(a.date);
            const daysB = this.calculateDaysUntilBirthday(b.date);
            return daysA - daysB;
        });
    }

    renderBirthdays() {
        if (this.birthdays.length === 0) {
            this.birthdaysList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎈</div>
                    <p class="empty-text">Aucun anniversaire enregistré</p>
                    <p class="empty-subtext">Ajoutez votre premier anniversaire ci-dessus !</p>
                </div>
            `;
            return;
        }

        const sortedBirthdays = this.sortBirthdaysByDate();
        
        this.birthdaysList.innerHTML = sortedBirthdays.map(birthday => {
            const daysUntil = this.calculateDaysUntilBirthday(birthday.date);
            const status = this.getBirthdayStatus(daysUntil);
            
            return `
                <div class="birthday-item ${status.class}">
                    <div class="birthday-info">
                        <div class="birthday-name">${this.escapeHtml(birthday.name)}</div>
                        <div class="birthday-date">${this.formatBirthdayDate(birthday.date)}</div>
                        <div class="birthday-countdown ${status.countdownClass}">
                            ${status.text}
                        </div>
                    </div>
                    <div class="birthday-actions">
                        <button class="btn btn-danger" onclick="birthdayReminder.deleteBirthday('${birthday.id}')">
                            Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const total = this.birthdays.length;
        const upcoming = this.birthdays.filter(b => {
            const days = this.calculateDaysUntilBirthday(b.date);
            return days >= 0 && days <= 30;
        }).length;
        
        this.totalCount.textContent = `${total} anniversaire${total > 1 ? 's' : ''}`;
        this.upcomingCount.textContent = `${upcoming} à venir (30j)`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const birthdayReminder = new BirthdayReminder();

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    document.getElementById('date').max = maxDate.toISOString().split('T')[0];
    
    setInterval(() => {
        birthdayReminder.renderBirthdays();
        birthdayReminder.updateStats();
    }, 60000);
});