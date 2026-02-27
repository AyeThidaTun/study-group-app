const prisma = require('./prismaClient');

// Fetch all suggestions with sorting and filtering by tags
module.exports.getAllSuggestions = function (searchTerm = '', sortBy = 'createdAt', sortOrder = 'asc', tags = []) {
    let query = {
        status: { not: 'DRAFT' }  // Filter out suggestions with status 'DRAFT'
    };

    // Filter by search term (if provided)
    if (searchTerm) {
        query = {
            ...query,
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
        };
    }

    // Filter by tags (if provided and not empty)
    if (tags.length > 0) {
        query = {
            ...query,
            tags: { hasSome: tags },
        };
    }

    return prisma.suggestion.findMany({
        where: query,
        orderBy: {
            [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
    })
        .then((suggestions) => {
            return suggestions;
        })
        .catch((error) => {
            console.error('Error fetching suggestions:', error);
            throw new Error('Error fetching suggestions');
        });
};



// Create a new suggestion
module.exports.createSuggestion = function ({ title, description, tag, createdById }) {
    return prisma.suggestion.create({
        data: {
            title,
            description,
            tags: tag ? [tag] : [], // Convert tag to an array if it's a single string or set it to an empty array
            createdAt: new Date(),
            createdById, // Associate the suggestion with the user
        },
    })
        .then((newSuggestion) => {
            console.log('Suggestion created:', newSuggestion); // Debugging
            return newSuggestion;
        })
        .catch((error) => {
            console.error('Error creating suggestion:', error);
            throw new Error('Error creating suggestion');
        });
};


// Fetch the latest draft for a user
module.exports.getLatestDraft = function (userId) {
    return prisma.suggestion.findFirst({
        where: {
            createdById: userId,
            status: "DRAFT"
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

// Update a suggestion
module.exports.updateSuggestion = function (id, updates) {
    return prisma.suggestion.update({
        where: { id },
        data: updates
    });
};

// Manage a suggestion (update status and reason)
module.exports.manageSuggestion = function (id, status, reason) {
    return prisma.suggestion.update({
        where: { id },
        data: {
            status,
            reason, // Store reason for the status change
        },
    })
        .then((updatedSuggestion) => updatedSuggestion)
        .catch((error) => {
            console.error('Error managing suggestion:', error);
            throw new Error('Error managing suggestion');
        });
};