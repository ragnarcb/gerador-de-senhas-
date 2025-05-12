import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  ScrollView,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../services/api';
import styles from './styles';

const Poke = ({ navigation }) => {
  const [pokemon, setPokemon] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'stats', 'moves'

  const fetchPokemonSpecies = async (id) => {
    try {
      const response = await api.get(`pokemon-species/${id}`);
      setPokemonSpecies(response.data);
    } catch (err) {
      console.error('Erro ao carregar espécie do Pokémon:', err);
    }
  };

  const fetchRandomPokemon = async () => {
    try {
      console.log('Carregando Pokémon aleatório...');
      setLoading(true);
      setError(null);
      setPokemonSpecies(null);
      
      // Gera um número aleatório entre 1 e 151 (primeira geração)
      const randomId = Math.floor(Math.random() * 151) + 1;
      console.log('ID do Pokémon:', randomId);
      
      const response = await api.get(`pokemon/${randomId}`);
      console.log('Pokémon carregado com sucesso:', response.data.name);
      setPokemon(response.data);
      fetchPokemonSpecies(randomId);
    } catch (err) {
      console.error('Erro ao carregar Pokémon:', err);
      setError('Erro ao carregar Pokémon: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const searchPokemon = async () => {
    if (!searchText.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setPokemonSpecies(null);
      
      // Converter para minúsculo e remover espaços
      const query = searchText.toLowerCase().trim();
      console.log('Buscando Pokémon:', query);
      
      const response = await api.get(`pokemon/${query}`);
      console.log('Pokémon encontrado:', response.data.name);
      setPokemon(response.data);
      fetchPokemonSpecies(response.data.id);
    } catch (err) {
      console.error('Erro ao buscar Pokémon:', err);
      setError(`Pokémon "${searchText}" não encontrado. Verifique o nome ou ID.`);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar o Pokémon quando o componente montar
  useEffect(() => {
    console.log('Componente Poke montado');
    fetchRandomPokemon();
  }, []);

  const handleGoBack = () => {
    console.log('Voltando para a tela anterior');
    navigation.goBack();
  };

  const renderInfoTab = () => (
    <View style={styles.infoContainer}>
      <View style={styles.basicInfo}>
        <Text style={styles.pokemonName}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <Text style={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.typesContainer}>
        {pokemon.types.map((type) => (
          <View 
            key={type.type.name} 
            style={[styles.typeBadge, { backgroundColor: getTypeColor(type.type.name) }]}
          >
            <Text style={styles.typeText}>
              {type.type.name.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      {pokemonSpecies && (
        <View style={styles.speciesInfo}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.flavorText}>
            {pokemonSpecies.flavor_text_entries
              .find(entry => entry.language.name === 'en')?.flavor_text
              .replace(/\f/g, ' ')
              || 'Informações não disponíveis.'}
          </Text>
          
          <View style={styles.physicalAttributes}>
            <View style={styles.attribute}>
              <Text style={styles.attributeLabel}>Altura</Text>
              <Text style={styles.attributeValue}>{pokemon.height / 10}m</Text>
            </View>
            <View style={styles.attribute}>
              <Text style={styles.attributeLabel}>Peso</Text>
              <Text style={styles.attributeValue}>{pokemon.weight / 10}kg</Text>
            </View>
            <View style={styles.attribute}>
              <Text style={styles.attributeLabel}>Categoria</Text>
              <Text style={styles.attributeValue}>
                {pokemonSpecies.genera
                  .find(genus => genus.language.name === 'en')?.genus
                  || 'Desconhecido'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Estatísticas</Text>
      {pokemon.stats.map((stat) => {
        const statValue = stat.base_stat;
        const statMaxValue = 255; // Valor máximo possível
        const percentage = (statValue / statMaxValue) * 100;
        
        return (
          <View key={stat.stat.name} style={styles.statRow}>
            <Text style={styles.statLabel}>
              {formatStatName(stat.stat.name)}
            </Text>
            <Text style={styles.statValue}>{statValue}</Text>
            <View style={styles.statBarContainer}>
              <View 
                style={[
                  styles.statBar, 
                  { 
                    width: `${percentage}%`,
                    backgroundColor: getStatColor(stat.stat.name)
                  }
                ]} 
              />
            </View>
          </View>
        );
      })}
      <Text style={styles.sectionSubtitle}>
        Total: {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
      </Text>
    </View>
  );

  const renderMovesTab = () => (
    <View style={styles.movesContainer}>
      <Text style={styles.sectionTitle}>Movimentos</Text>
      <FlatList
        data={pokemon.moves.slice(0, 15)} // Limitar para os primeiros 15 movimentos
        keyExtractor={(item) => item.move.name}
        renderItem={({ item }) => (
          <View style={styles.moveItem}>
            <Text style={styles.moveName}>
              {formatMoveName(item.move.name)}
            </Text>
            <Text style={styles.moveDetail}>
              {item.version_group_details[0].move_learn_method.name === 'level-up' 
                ? `Nível ${item.version_group_details[0].level_learned_at}` 
                : capitalizeFirstLetter(item.version_group_details[0].move_learn_method.name)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>Nenhum movimento encontrado.</Text>
        }
      />
    </View>
  );

  const formatStatName = (statName) => {
    const statNames = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Atq. Especial',
      'special-defense': 'Def. Especial',
      'speed': 'Velocidade'
    };
    return statNames[statName] || capitalizeFirstLetter(statName);
  };

  const formatMoveName = (moveName) => {
    return moveName.split('-').map(word => capitalizeFirstLetter(word)).join(' ');
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getStatColor = (statName) => {
    const statColors = {
      'hp': '#FF5959',
      'attack': '#F5AC78',
      'defense': '#FAE078',
      'special-attack': '#9DB7F5',
      'special-defense': '#A7DB8D',
      'speed': '#FA92B2'
    };
    return statColors[statName] || '#A8A878';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A86E8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pokédex</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou número"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchPokemon}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchPokemon}>
          <FontAwesome5 name="search" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A86E8" />
            <Text style={styles.loadingText}>Carregando Pokémon...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={40} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchRandomPokemon}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : pokemon ? (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'info' && styles.activeTabButton]}
                onPress={() => setActiveTab('info')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'info' && styles.activeTabButtonText]}>Informações</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'stats' && styles.activeTabButton]}
                onPress={() => setActiveTab('stats')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'stats' && styles.activeTabButtonText]}>Estatísticas</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'moves' && styles.activeTabButton]}
                onPress={() => setActiveTab('moves')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'moves' && styles.activeTabButtonText]}>Movimentos</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'stats' && renderStatsTab()}
            {activeTab === 'moves' && renderMovesTab()}

            <TouchableOpacity
              style={styles.newPokemonButton}
              onPress={fetchRandomPokemon}
            >
              <FontAwesome5 name="sync-alt" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>NOVO POKÉMON ALEATÓRIO</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Nenhum Pokémon carregado</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchRandomPokemon}
            >
              <Text style={styles.retryButtonText}>Carregar Pokémon</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Função para retornar cores baseadas no tipo do Pokémon
const getTypeColor = (type) => {
  const colors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  return colors[type] || '#A8A878';
};

export default Poke; 