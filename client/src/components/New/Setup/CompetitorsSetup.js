import React, { useState, useEffect, forwardRef } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import LinearProgress from '@material-ui/core/LinearProgress'
import MaterialTable from 'material-table'
import mongoose from 'mongoose'

import AddBox from '@material-ui/icons/AddBox'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Check from '@material-ui/icons/Check'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Clear from '@material-ui/icons/Clear'
import DeleteOutline from '@material-ui/icons/DeleteOutline'
import Edit from '@material-ui/icons/Edit'
import FilterList from '@material-ui/icons/FilterList'
import FirstPage from '@material-ui/icons/FirstPage'
import LastPage from '@material-ui/icons/LastPage'
import Remove from '@material-ui/icons/Remove'
import SaveAlt from '@material-ui/icons/SaveAlt'
import Search from '@material-ui/icons/Search'
import ViewColumn from '@material-ui/icons/ViewColumn'
import StepActions from './StepActions'

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
}

const GET_WCIF_COMPETITORS_QUERY = gql`
    query getWcifById($id: String!) {
        getWcifById(_id: $id) {
            persons {
                name
                wcaUserId
                wcaId
                registrantId
                countryIso2
                gender
                birthdate
                email
                _id
            }
        }
    }
`

const UPDATE_COMPETITION_COMPETITORS_MUTATION = gql`
    mutation updateWcifCompetitors($id: String!, $updatedCompetitors: WcifPersons!) {
        updateWcifCompetitors(_id: $id, updatedCompetitors: $updatedCompetitors) {
            id
            name
        }
    }
`

export default function CompetitorsSetup({ id, onComplete, handleBack, handleReset }) {
    const columns = [
        { title: 'Name', field: 'name' },
        { title: 'WCA ID', field: 'wcaId' },
        { title: 'Country', field: 'countryIso2' },
        { title: 'Email', field: 'email' },
        { title: 'Birthdate', field: 'birthdate' },
    ]
    const [localData, setLocalData] = useState(null)
    const query = useQuery(GET_WCIF_COMPETITORS_QUERY, {
        variables: { id: id },
    })
    useEffect(() => {
        !query.loading && !query.error && setLocalData(query.data.getWcifById.persons)
    }, [query.loading, query.error, query.data])

    const [updateWcifCompetitors, mutationOptions] = useMutation(UPDATE_COMPETITION_COMPETITORS_MUTATION)

    const handleAdd = (addData) => {
        const newRegistrantId = Math.max.apply(
            Math,
            localData.map((o) => o.registrantId)
        )
        const newCompetitor = {
            ...addData,
            registrantId: newRegistrantId,
            wcaUserId: -1,
            _id: mongoose.Types.ObjectId().toString(),
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                setLocalData([...localData, newCompetitor])
                resolve()
            }, 200)
        })
    }
    const handleUpdate = (newData, oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                setLocalData(localData.map((competitor) => (competitor._id === newData._id ? newData : competitor)))
                resolve()
            }, 200)
        })
    }

    const handleComplete = () => {
        let competitors = []
        localData.map(({ tableData, ...competitor }) => competitors.push(competitor))
        console.log(JSON.stringify(competitors))
        const JSONdata = JSON.stringify(competitors)
        updateWcifCompetitors({ variables: { id, updatedCompetitors: competitors } }).then(() => onComplete())
    }

    if (query.loading || !localData) return <LinearProgress />
    if (query.error) console.error(query.error)
    return (
        <>
            <MaterialTable
                icons={tableIcons}
                columns={columns}
                data={localData}
                title='Edit Competitors'
                editable={{
                    onRowAdd: handleAdd,
                    onRowUpdate: handleUpdate,
                }}
            />
            <StepActions
                handleBack={handleBack}
                loading={mutationOptions.loading}
                handleComplete={handleComplete}
                handleReset={handleReset}
            />
        </>
    )
}
