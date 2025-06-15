import React, { useContext, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Button,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Modal,
} from 'react-native';
import Header from '../components/Header';
import { AuthContext } from '../utils/AuthContext';
import useApi from '../utils/api';
import DashboardLabel from '../components/DashboardLabel';
import { Provider as PaperProvider, DataTable, Card, Button as NButton, Text as NText } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { DatePickerModal, registerTranslation } from 'react-native-paper-dates';
import en from 'date-fns/locale/en-US'
import { format } from 'date-fns';
import MultiSelect from 'react-native-multiple-select';
import Icon from 'react-native-vector-icons/FontAwesome'; // or Ionicons, MaterialIcons, etc.
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    registerTranslation('en', en);
    const { user } = useContext(AuthContext);
    const { request } = useApi();
    const [dashboardvalues, setDashboardValues] = useState([]);
    const [school, setschool] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState([]);
    const today = new Date();
    const [modalVisible, setModalVisible] = useState(false);

    // Get date 30 days ago
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30);
    const [range, setRange] = useState({ startDate: today, endDate: pastDate });
    const [open, setOpen] = useState(false);

    const formatDate = (dateStr) => {
        // dateStr expected as 'DD-MM-YYYY'
        const [day, month, year] = dateStr.split('-');
        // Construct ISO date string YYYY-MM-DD for Date constructor
        const isoDateStr = `${year}-${month}-${day}`;
        const dateObj = new Date(isoDateStr);
        if (isNaN(dateObj)) {
            return dateStr; // fallback to original string
        }
        return dateObj.toISOString().split('T')[0];
    };
    const getDashboard = useCallback(async () => {
        try {
            const data = {
                ngocode: user.ngocode,
                startdate: Platform.OS === 'ios' ? formatDate('12-05-2025') : '12-05-2025',
                enddate: Platform.OS === 'ios' ? formatDate('10-06-2025') : '10-06-2025',
                ngo: user.ngo,
                school: user.school,
            };

            const result = await request({
                method: 'POST',
                url: '/dashboard/',  // Automatically added to baseURL
                body: data
            });
            if (result.success) {
                setDashboardValues(result.dashboardValues[0]);
            }
        } catch (error) {
            console.error('Dashboard error:', error.response?.data || error.message);
        }
    }, [user]);

    const getSchool = useCallback(async () => {
        try {
            const result = await request({
                method: 'GET',
                url: `/school/${user.school}`,
            });
            //console.log(result)
            if (result.success) {
                const school = result.schools;
                const filteredData = school.map((item) => ({
                    oid: item.oid.toString(),
                    name: item.schoolname,
                }));
                setschool(filteredData);
            }
        } catch (error) {
            console.error('School error:', error.response?.data || error.message);
        }
    }, [user.school]);

    useFocusEffect(
        useCallback(() => {
            if (user?.school && user?.ngocode) {
                getSchool();
                getDashboard();
            }
        }, [getSchool, getDashboard])
    );
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header />
            <View style={styles.searchSection}>
                <View style={styles.innerBody}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.findNearbyTitle}>Dashboard</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
                            <Icon name="filter" size={30} color="#4F8EF7" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.filterBar}>
                        <Modal visible={modalVisible} animationType="slide" transparent={true}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    {/* Header */}
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Filter Dashboard</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                            <Text style={styles.closeButtonText}>×</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Body */}
                                    <View style={styles.modalBody}>
                                        <MultiSelect
                                            items={school}
                                            uniqueKey="oid"
                                            onSelectedItemsChange={setSelectedSchool}
                                            selectedItems={selectedSchool}
                                            selectText="Select School(s)..."
                                            searchInputPlaceholderText="Search School(s)..."
                                            tagRemoveIconColor="#CCC"
                                            tagBorderColor="#CCC"
                                            tagTextColor="#333"
                                            selectedItemTextColor="#007BFF"
                                            selectedItemIconColor="#007BFF"
                                            itemTextColor="#000"
                                            searchInputStyle={{ color: '#000' }}
                                            styleMainWrapper={{ marginBottom: 15 }}
                                        />

                                        <View style={styles.datePickerRow}>
                                            <NButton
                                                icon="calendar"
                                                mode="outlined"
                                                onPress={() => setOpen(true)}
                                                style={{ flex: 1, marginRight: 10 }}
                                                contentStyle={{ flexDirection: 'row-reverse' }}
                                                labelStyle={{ fontSize: 14 }}
                                            >
                                                Select Date Range
                                            </NButton>
                                            <NText style={styles.dateRangeText}>
                                                {range.startDate ? format(range.startDate, 'dd-MM-yyyy') : 'Start'} - {range.endDate ? format(range.endDate, 'dd-MM-yyyy') : 'End'}
                                            </NText>
                                        </View>

                                        <DatePickerModal
                                            locale="en"
                                            mode="range"
                                            visible={open}
                                            onDismiss={() => setOpen(false)}
                                            startDate={range.startDate}
                                            endDate={range.endDate}
                                            onConfirm={({ startDate, endDate }) => {
                                                setOpen(false);
                                                setRange({ startDate, endDate });
                                            }}
                                        />
                                    </View>

                                    {/* Footer */}
                                    <View style={styles.modalFooter}>
                                        <Button title="Apply Filters" onPress={() => {
                                            setModalVisible(false);
                                            alert('Filters Applied');
                                        }} />
                                    </View>

                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            </View>
            <View style={styles.container}>
                <View style={{ width: width * 0.3 }}>
                    <DashboardLabel
                        icon="shopping-cart"
                        label="Created"
                        value={dashboardvalues.created}
                        color="#17a2b8"
                    />
                </View>

                <View style={{ width: width * 0.3 }}>
                    <DashboardLabel
                        icon="bars"
                        label="Delivered"
                        value={dashboardvalues.delivered}
                        color="#28a745"
                    />
                </View>

                <View style={{ width: width * 0.3 }}>
                    <DashboardLabel
                        icon="user-plus"
                        label="Received"
                        value={dashboardvalues.received}
                        color="#f39c12"
                    />
                </View>
            </View>
            <View style={styles.hr} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80} style={{ flex: 1 }}>
                <ScrollView vertical showsverticalScrollIndicator={true}>
                    <Card style={{ backgroundColor: "#fff" }}>
                        <DataTable style={styles.table}>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>No Of Meals</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.nofomeals}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Rice</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.rice}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Sambar</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.sambar}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Milk</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.milk}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Egg</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.egg}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Chikki</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.shengachikki}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Banana</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.banana}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Total</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.total}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Delivered</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.delivered}
                                </DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell style={styles.cell}>Received</DataTable.Cell>
                                <DataTable.Cell numeric style={styles.cell}>
                                    {dashboardvalues.received}
                                </DataTable.Cell>
                            </DataTable.Row>
                        </DataTable>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    hr: {
        borderBottomColor: '#bbb',  // line color
        borderBottomWidth: StyleSheet.hairlineWidth, // thin line
        marginVertical: 10,  // spacing above & below
        width: '100%',      // full width (or customize)
    },
    innerBody: {
        backgroundColor: 'lightgray',
        borderRadius: 10
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // dark transparent background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10, // for Android shadow
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    closeButton: {
        padding: 4,
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee',
    },
    closeButtonText: {
        fontSize: 22,
        color: '#333',
        lineHeight: 24,
        textAlign: 'center',
    },
    modalBody: {
        marginBottom: 20,
    },
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    dateRangeText: {
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',      // side-by-side
        alignItems: 'center',      // vertically centered
        justifyContent: 'space-between', // space between text & button
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingBottom: 4
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 10
    },
    table: {
        padding: 20,
        borderColor: '#ccc',
    },
    cell: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        justifyContent: 'center',
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    findNearbyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: '3%',
        marginTop: '2%'
    },
    filterBar: {
        flexDirection: 'row',
        // height: 40,
    },
    subFilter: {
        flex: 1,
        padding: 10,
        justifyContent: "center"
    },
    button: {
        width: 80
    }
});
