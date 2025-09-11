const matchConditionsPipeline = (symptomKeywords) => {
    return [
        {
        $match: {
            symptoms: { $in: symptomKeywords }
        }
        },
        {
        $addFields: {
            matchedSymptoms: {
            $setIntersection: ["$symptoms", symptomKeywords]
            },
            totalSymptoms: { $size: "$symptoms" }
        }
        },
        {
        $addFields: {
            matchCount: { $size: "$matchedSymptoms" },
            confidenceScore: {
            $divide: [
                { $size: "$matchedSymptoms" },
                { $add: ["$totalSymptoms", 1] }
            ]
            }
        }
        },
        {
        $sort: { confidenceScore: -1 }
        },
        {
        $project: {
            name: 1,
            description: 1,
            matchedSymptoms: 1,
            confidenceScore: 1
        }
        }
    ];
};


module.exports = {matchConditionsPipeline};
