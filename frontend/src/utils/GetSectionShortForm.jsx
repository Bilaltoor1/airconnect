const getSectionShortForm = (sectionName) => {
    return sectionName
        .split(' ')
        .map(word => word[0].toLowerCase())
        .join('');
};

const getSectionColor = (sectionName) => {
    switch (sectionName.toLowerCase()) {
        case 'software engineering':
            return 'bg-yellow-500'; // Color for Software Engineering
        case 'computer science':
            return 'bg-green-500'; // Color for CSS
        case 'cyber security':
            return 'bg-red-500'; // Color for Cyber Security
        case 'math':
            return 'bg-purple-500'; // Color for Math
        case 'english':
            return 'bg-yellow-500'; // Color for English
        case 'aviation engineering':
            return 'bg-orange-500'; // Color for Aviation Engineering
        default:
            return 'bg-pink-400'; // Default color
    }
};



const getBatchColor = (batchName) => {
    switch (batchName) {
        case 'se-fall-21':
            return 'bg-blue-500'; // Color for Fall-21
        case 'cs-fall-21':
            return 'bg-green-500'; // Color for Fall-22
        case 'fall-23':
            return 'bg-red-500'; // Color for Fall-23
        case 'fall-24':
            return 'bg-purple-500'; // Color for Fall-24
        case 'fall-25':
            return 'bg-orange-500'; // Color for Fall-25
        case 'fall-26':
            return 'bg-yellow-500'; // Color for Fall-26
        case 'fall-27':
            return 'bg-pink-500'; // Color for Fall-27
        case 'fall-28':
            return 'bg-teal-500'; // Color for Fall-28
        case 'fall-29':
            return 'bg-indigo-500'; // Color for Fall-29
        case 'fall-30':
            return 'bg-gray-500'; // Color for Fall-30
        default:
            return 'bg-black'; // Default color
    }
};

export { getBatchColor , getSectionShortForm, getSectionColor };
