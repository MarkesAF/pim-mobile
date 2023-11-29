import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, Text, View, TextInput } from 'react-native';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://192.168.1.11:8080/funcionarios')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Erro ao buscar os funcionários:', error));
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {data.map((item, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <Text>Nome: {item.nome}</Text>
          <Text>Cargo: {item.cargo}</Text>
          <Text>CPF: {item.cpf}</Text>
        </View>
      ))}
      <Button
        title="Folha Pelo Cargo"
        onPress={() => navigation.navigate('SelectCargo')}
      />
      <Button
        title="Folha de Pagamento"
        onPress={() => navigation.navigate('Payroll')}
      />
    </View>
  );
}

function PayrollScreen({ route }) {
  const [payrollData, setPayrollData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [totalGeral, setTotalGeral] = useState(0);

  useEffect(() => {
    if (route.params && route.params.cargo) {
      const cargo = route.params.cargo;

      fetch(`http://192.168.1.11:8080/folha-de-pagamento/by-cargo/${cargo}`)
        .then((response) => response.json())
        .then((data) => {
          setPayrollData(data);
          const aggregated = aggregateData(data);
          setAggregatedData(aggregated);

          let total = 0;
          aggregated.forEach(item => {
            total += item.salario + item.bonus - item.descontos;
          });
          setTotalGeral(total);
        })
        .catch((error) => console.error('Erro ao buscar a folha de pagamento:', error));
    } else {
      fetch('http://192.168.1.11:8080/folha-de-pagamento')
        .then((response) => response.json())
        .then((data) => {
          setPayrollData(data);
          const aggregated = aggregateData(data);
          setAggregatedData(aggregated);

          let total = 0;
          aggregated.forEach(item => {
            total += item.salario + item.bonus - item.descontos;
          });
          setTotalGeral(total);
        })
        .catch((error) => console.error('Erro ao buscar a folha de pagamento:', error));
    }
  }, [route.params]);

  const aggregateData = (data) => {
    let aggregated = {
      salario: 0,
      descontos: 0,
      bonus: 0
    };

    data.forEach(item => {
      aggregated.salario += parseFloat(item.salario);
      aggregated.descontos += parseFloat(item.descontos);
      aggregated.bonus += parseFloat(item.bonus);
    });

    aggregated.total = aggregated.salario + aggregated.bonus - aggregated.descontos;

    return [aggregated]; // Retorna um array com o objeto agregado
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Informações da Folha de Pagamento:</Text>
      {aggregatedData.map((item, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <Text>Total Salário Base: {item.salario.toFixed(2)}</Text>
          <Text>Total de Descontos: {item.descontos.toFixed(2)}</Text>
          <Text>Total de Bônus: {item.bonus.toFixed(2)}</Text>
        </View>
      ))}
      <Text style={{ fontWeight: 'bold', marginTop: 20 }}>
        Total Geral: {totalGeral.toFixed(2)}
      </Text>
    </View>
  );
}

function SelectCargoScreen({ navigation }) {
  const [cargo, setCargo] = useState('');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Digite o cargo desejado:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        onChangeText={(text) => setCargo(text)}
        value={cargo}
      />
      <Button
        title="Buscar Folha de Pagamento"
        onPress={() => navigation.navigate('Payroll', { cargo })}
      />
    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Lista de Funcionários' }} />
        <Stack.Screen name="Payroll" component={PayrollScreen} options={{ title: 'Folha de Pagamento' }} />
        <Stack.Screen name="SelectCargo" component={SelectCargoScreen} options={{ title: 'Selecionar Cargo' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

