import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { AuthContext } from '../utils/AuthContext';
import useApi from '../utils/api';
import DashboardLabel from '../components/DashboardLabel';
import { Provider as PaperProvider, DataTable, Card, Button as NButton, Text as NText } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { DatePickerModal, registerTranslation } from 'react-native-paper-dates';
import en from 'date-fns/locale/en-US'
import { format } from 'date-fns';
import { MultiSelect } from 'react-native-element-dropdown';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
// import Icon from 'react-native-vector-icons/FontAwesome'; // or Ionicons, MaterialIcons, etc.
import { FontAwesome } from '@expo/vector-icons';

export default function DashboardScreen() {
    registerTranslation('en', {
        save: 'Save',
        selectSingle: 'Select date',
        selectMultiple: 'Select dates',
        selectRange: 'Select period',
        notAccordingToDateFormat: (inputFormat) => `Date format should be`,// ${inputFormat}
        mustBeHigherThan: (date) => `Must be later than `,//${date}
        mustBeLowerThan: (date) => `Must be earlier than`,// ${date}
        mustBeBetween: (startDate, endDate) => `Must be between `,//${startDate} - ${endDate}
        dateIsDisabled: 'Date is not allowed',
        previous: 'Previous',
        next: 'Next',
        typeInDate: 'Type in date',
        pickDateFromCalendar: 'Pick date from calendar',
        close: 'Close',
    });
    const { user, logout } = useContext(AuthContext);
    const { request } = useApi();
    const [dashboardvalues, setDashboardValues] = useState([]);
    const [school, setschool] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState([]);
    const today = new Date();
    const [modalVisible, setModalVisible] = useState(false);

    // Get date 30 days ago
    const pastDate = new Date();
    //   console.log(pastDate+'  start')
    pastDate.setDate(today.getDate() - 30);
    // console.log(pastDate)
    const [range, setRange] = useState({ startDate: pastDate, endDate: today });
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

    const handleFilter = async () => {
        await getDashboard();
    }
    const getDashboard = useCallback(async () => {
        try {
            const data = {
                ngocode: user.ngocode,
                startdate: format(range.startDate, 'dd-MM-yyyy'),//10-06-2025
                enddate: format(range.endDate, 'dd-MM-yyyy'),
                ngo: user.ngo,
                school: selectedSchool.length > 0 ? selectedSchool.join(',') : user.school,
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
            if (error?.response?.status === 401) {
                // Unauthorized — session expired
                logout();
            }
        }
    }, [user, range, selectedSchool]);

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
                const withSelectAll = [{ oid: user.school, name: 'All' }, ...filteredData];
                setschool(withSelectAll);
            }
        } catch (error) {
            if (!error.status)
                logout();
            // console.error('School error:', error.response?.data || error.message);
        }
    }, [user.school]);

    // useFocusEffect(
    //     useCallback(() => {
    //         if (user?.school && user?.ngocode) {
    //             getSchool();
    //             getDashboard();
    //         }
    //     }, [getSchool, getDashboard])
    // );

    useEffect(() => {
        if (user?.school && user?.ngocode) {
            getSchool();
            getDashboard();
        }
    }, [user]);

    const labelIconMap = {
        'No Of Meals': 'cutlery',
        'Rice': 'spoon',
        'Sambar': 'tint',
        'Milk': 'glass',
        'Egg': 'egg',
        'Chikki': 'birthday-cake',
        'Banana': 'leaf',
        'Total': 'calculator',
        'Delivered': 'truck',
        'Received': 'check-circle',
    };

    const setQuickDate = (offsetDays = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        setRange({ startDate: date, endDate: date });
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header pageTitle="Dashboard" />
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => (setSelectedSchool(selectedSchool), setModalVisible(true))} style={styles.filterChip}>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.chipText}>
                            <FontAwesome name="calendar" size={18} color="#4F8EF7" style={{ marginRight: 8 }} />
                            {'  '}
                            {format(range.startDate, 'dd-MMM-yyyy')} to {format(range.endDate, 'dd-MMM-yyyy')}
                        </Text>
                        <Text style={styles.selectedSchoolText}>
                            School(s): {selectedSchool.length === 0 || selectedSchool.length === school.length - 1
                                ? 'All Schools'
                                : school
                                    .filter(s => selectedSchool.includes(s.oid))
                                    .map(s => s.name)
                                    .join(', ')
                            }
                        </Text>
                    </View>
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
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={school}
                                    labelField="name"
                                    valueField="oid"
                                    key="oid"
                                    placeholder="Select School(s)"
                                    search
                                    value={selectedSchool}
                                    onChange={item => setSelectedSchool(item)}
                                    selectedStyle={styles.selectedStyle}
                                />
                                <View style={styles.datePickerRow}>
                                    <NButton
                                        icon="calendar"
                                        mode="outlined"
                                        onPress={() => setOpen(true)}
                                        style={{ flex: 1, marginRight: 10, color: '#555', marginBottom: 10 }}
                                        contentStyle={{ flexDirection: 'row-reverse' }}
                                        labelStyle={{ fontSize: 14, color: '#555', }}
                                    >
                                        <NText style={styles.dateRangeText}>
                                            {range.startDate && range.endDate ? (
                                                <Text>{range.startDate ? format(range.startDate, 'dd-MMM-yyyy') : 'Start'} - {range.endDate ? format(range.endDate, 'dd-MMM-yyyy') : 'End'}</Text>
                                            ) : (
                                                <Text>Select Date</Text>
                                            )}
                                        </NText>
                                    </NButton>

                                </View>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <NButton
                                        style={styles.dateButton}
                                        mode="outlined"
                                        onPress={() => setQuickDate(-1)}
                                        labelStyle={{ fontSize: 12 }}
                                        compact
                                    >
                                        Yesterday
                                    </NButton>
                                    <NButton
                                        style={styles.dateButton}
                                        mode="outlined"
                                        onPress={() => setQuickDate(0)}
                                        labelStyle={{ fontSize: 12 }}
                                        compact
                                    >
                                        Today
                                    </NButton>
                                    <NButton
                                        style={styles.dateButton}
                                        mode="outlined"
                                        onPress={() => setQuickDate(1)}
                                        labelStyle={{ fontSize: 12 }}
                                        compact
                                    >
                                        Tomorrow
                                    </NButton>
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
                                    handleFilter();
                                }} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
            <View style={styles.container}>
                {[
                    { icon: 'plus', label: 'Created', value: dashboardvalues.created, color: '#17a2b8' },
                    { icon: 'truck', label: 'Delivered', value: dashboardvalues.delivered, color: '#28a745' },
                    { icon: 'check', label: 'Received', value: dashboardvalues.received, color: '#f39c12' },
                ].map(item => (
                    <View key={item.label} style={styles.dashboardBox}>
                        <DashboardLabel {...item} />
                    </View>
                ))}
            </View>
            <View style={styles.hr} />

            <KeyboardAvoidingView keyboardVerticalOffset={80} style={{ flex: 1 }}>
                <ScrollView vertical showsverticalScrollIndicator={true}>
                    <Card style={{ backgroundColor: "#fff", margin: 10, borderRadius: 12, elevation: 3 }}>
                        <DataTable>
                            {/* Table Header */}
                            <DataTable.Header style={styles.tableHeader}>
                                <DataTable.Title textStyle={styles.tableHeaderText}>Item</DataTable.Title>
                                <DataTable.Title numeric textStyle={styles.tableHeaderText}>Quantity</DataTable.Title>
                            </DataTable.Header>
                            {[
                                { label: 'No Of Meals', value: dashboardvalues.nofomeals },
                                { label: 'Hot Meals', value: dashboardvalues.hotmeals },
                                { label: 'Milk', value: dashboardvalues.milk },
                                { label: 'Egg', value: dashboardvalues.egg },
                                { label: 'Banana', value: dashboardvalues.banana },
                                { label: 'Total', value: dashboardvalues.total, highlight: true },
                                { label: 'Delivered', value: dashboardvalues.delivered },
                                { label: 'Received', value: dashboardvalues.received },
                            ].map((item, index) => (
                                <DataTable.Row
                                    key={item.label}
                                    style={[
                                        styles.tableRow,
                                        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                                        item.highlight && styles.totalRow,
                                    ]}
                                >
                                    <DataTable.Cell style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Icon
                                            name={labelIconMap[item.label] || 'circle'} // fallback icon
                                            size={14}
                                            color="#555"
                                            style={{ marginRight: 8 }}
                                        /> */}
                                        <Text> {item.label}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric >
                                        <Text style={item.highlight ? styles.totalText : null}>{item.value}</Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    dateButton: {
        width: '30%',
        marginVertical: 4,
    },
    selectedSchoolContainer: {
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 20,
    },
    selectedSchoolText: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    dashboardBox: {
        width: width * 0.28,
        margin: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#90caf9',
    },
    chipText: {
        fontSize: 14,
        color: '#1565c0',
        fontWeight: '500',
    },
    tableHeader: {
        backgroundColor: '#4F8EF7',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    tableHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    tableRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    rowEven: {
        backgroundColor: '#f9f9f9',
    },
    rowOdd: {
        backgroundColor: '#fff',
    },
    totalRow: {
        backgroundColor: '#e0f7fa',
    },
    totalText: {
        fontWeight: 'bold',
        color: '#00796b',
        fontSize: 15,
    },
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
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
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
        flexDirection: 'row',
        justifyContent: 'center', // Aligns children to the right
        paddingHorizontal: 16,
        // borderWidth: 1,
        borderRadius: 50,
        marginVertical: 15,
        margin: width * 0.1,
        // width: width * 1,
        // left: 100
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    table: {
        padding: 10,
        borderColor: '#ccc',
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    findNearbyTitle: {
        fontSize: 18,
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
    },
    iconButton: {
        flexDirection: 'row',
        padding: 8,

    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 10,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#000',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    selectedStyle: {
        borderRadius: 12,
    },

});
