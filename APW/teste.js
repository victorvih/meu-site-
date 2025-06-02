// teste.js

function getUserPreferences() {
    return {
        size: document.querySelector('input[name="size"]:checked')?.value || '',
        temperament: document.querySelector('input[name="temperament"]:checked')?.value || '',
        life_span: document.querySelector('input[name="life_span"]:checked')?.value || '',
        origin: document.querySelector('input[name="origin"]:checked')?.value || '',
        weight: document.querySelector('input[name="weight"]:checked')?.value || ''
    };
}

function runTest() {
    const userPrefs = getUserPreferences();
    console.log("📋 Suas preferências:", userPrefs);
    getMatchingBreeds(userPrefs);
}

async function getMatchingBreeds(userPrefs) {
    const url = 'https://api.thedogapi.com/v1/breeds'; 
    const apiKey = 'live_3JFxMfYR6dL0NihqBPYZtHRi6vPjCFsbXXZ722q2UZ0SLeI93xjbnR0HvqrTvtWo'; // Substitua pela sua chave real

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

        let breeds = await response.json();

        if (!breeds.length) {
            alert("Nenhuma raça encontrada.");
            showFallbackBreeds();
            return;
        }

        breeds = breeds.filter(breed => breed.name && breed.image?.url);

        const matches = breeds.map(breed => {
            let matchCount = 0;

            // Tamanho (inferido pela altura)
            const height = parseInt(breed.height?.metric.split(' ')[0]) || 0;
            const inferredSize = height < 40 ? 'Small' : height <= 60 ? 'Medium' : 'Large';
            if (userPrefs.size && inferredSize === userPrefs.size) matchCount += 1;

            // Temperamento
            if (userPrefs.temperament && breed.temperament && breed.temperament.toLowerCase().includes(userPrefs.temperament.toLowerCase())) {
                matchCount += 1;
            }

            // Expectativa de vida
            if (userPrefs.life_span && breed.life_span && breed.life_span.includes(userPrefs.life_span)) {
                matchCount += 1;
            }

            // Origem
            if (userPrefs.origin && breed.origin && breed.origin.toLowerCase().includes(userPrefs.origin.toLowerCase())) {
                matchCount += 1;
            }

            // Peso
            if (userPrefs.weight) {
                const avgWeight = parseFloat(breed.weight?.metric.split(' - ')[0]);
                const [min, max] = userPrefs.weight.split(' - ').map(parseFloat);
                if (!isNaN(avgWeight)) {
                    if ((min && !max && avgWeight <= min) ||
                        (min && max && avgWeight >= min && avgWeight <= max) ||
                        (max && !min && avgWeight >= max)) {
                        matchCount += 1;
                    }
                }
            }

            return { ...breed, matchCount };
        })
        .filter(breed => breed.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 5); // Top 5 resultados

        displayResults(matches);

    } catch (error) {
        console.error("🚨 Erro ao buscar raças:", error);
        alert("Ocorreu um erro ao carregar as raças.");
        showFallbackBreeds();
    }
}

// Função para traduzir temperamento para o português
function translateTemperament(temperament) {
    if (!temperament) return 'Não informado';

    const temperamentMap = {
        'friendly': 'Amigável',
        'loyal': 'Leal',
        'intelligent': 'Inteligente',
        'energetic': 'Energético',
        'calm': 'Calmo',
        'playful': 'Brincalhão',
        'gentle': 'Gentil',
        'alert': 'Alerta',
        'watchful': 'Vigilante',
        'independent': 'Independente',
        'docile': 'Dócil',
        'active': 'Ativo',
        'trainable': 'Treinável',
        'protective': 'Protetor',
        'affectionate': 'Afetuoso',
        'courageous': 'Corajoso',
        'bold': 'Destemido',
        'cautious': 'Cauteloso',
        'sensitive': 'Sensível'
    };

    // Divide os temperamentos e traduz cada um
    return temperament
        .split(', ')
        .map(temp => temperamentMap[temp.toLowerCase()] || temp)
        .join(', ');
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (!results.length) {
        resultsContainer.innerHTML = `
            <div class="text-center text-muted mb-4">
                <p>Nenhuma raça foi totalmente compatível com suas preferências.</p>
                <p>Aqui estão algumas raças populares:</p>
            </div>
        `;
        showFallbackBreeds();
        return;
    }

    results.forEach(breed => {
        const div = document.createElement('div');
        div.className = 'card mb-4 shadow-sm';

        const imageUrl = breed.image?.url 
            ? `<img src="${breed.image.url}" class="card-img-top" alt="${breed.name}">` 
            : '<p class="text-center mt-3">Sem imagem disponível</p>';

        div.innerHTML = `
            ${imageUrl}
            <div class="card-body">
                <h5 class="card-title">${breed.name}</h5>
                <p class="card-text">
                    <strong>Tamanho estimado:</strong> ${getInferredSize(breed)}<br>
                    <strong>Temperamento:</strong> ${translateTemperament(breed.temperament) || 'Não informado'}<br>
                    <strong>Origem:</strong> ${breed.origin || 'Não informado'}<br>
                    <strong>Peso:</strong> ${breed.weight?.metric || 'Não informado'}<br>
                    <strong>Esperança de vida:</strong> ${breed.life_span || 'Não informado'}<br>
                    <strong>Compatibilidade:</strong> ${breed.matchCount}/5 critérios batem
                </p>
            </div>
        `;
        resultsContainer.appendChild(div);
    });
}

function getInferredSize(breed) {
    const height = parseInt(breed.height?.metric.split(' ')[0]);
    if (!height) return 'Não informado';
    if (height < 40) return 'Pequeno';
    if (height <= 60) return 'Médio';
    return 'Grande';
}

function showFallbackBreeds() {
    const fallbackBreeds = [
        { name: "Golden Retriever", image: "https://images.dog.ceo/breeds/retriever-golden/n02099601_6125.jpg"  },
        { name: "Labrador Retriever", image: "https://images.dog.ceo/breeds/labrador/n02099712_6511.jpg"  },
        { name: "Poodle", image: "https://images.dog.ceo/breeds/poodle-standard/n02113712_3204.jpg"  },
        { name: "Beagle", image: "https://images.dog.ceo/breeds/beagle/n02088466_9748.jpg"  },
        { name: "Bulldog Francês", image: "https://images.dog.ceo/breeds/bulldog-french/n02099267_3732.jpg"  }
    ];

    fallbackBreeds.forEach(breed => {
        const div = document.createElement('div');
        div.className = 'card mb-4 shadow-sm';

        div.innerHTML = `
            <img src="${breed.image}" class="card-img-top" alt="${breed.name}">
            <div class="card-body">
                <h5 class="card-title">${breed.name}</h5>
                <p class="card-text">
                    Uma das raças mais populares do mundo. Amigável, inteligente e fácil de treinar.
                </p>
            </div>
        `;
        document.getElementById('results').appendChild(div);
    });
}