import React, { useState, useEffect } from 'react';
import axios from 'axios'
import PipelinePreview from './PipelinePreview'
import OptionCard from './OptionCard';
import _ from 'lodash'

import LanguageDialog from './LanguageDialog';
import FormRecCustomDialog from './FormRecCustomDialog';
import LanguageCustomNerDialog from './LanguageCustomNerDialog';
import LanguageMultiClassifyDialog from './LanguageMultiClassifyDialog';
import LanguageSingleClassifyDialog from './LanguageSingleClassifyDialog'
import HuggingFaceDialog from './HuggingFaceDialog'
import DocumentTranslationDialog from './DocumentTranslationDialog';
import SpeechToTextDialog from './SpeechToText';
import ChangeDataDialog from './ChangeDataDialog';
//import CopyDialog from './CopyDialog';
import ToTxtDialog from './ToTxtDialog';
import Prices from './Prices'

import { sc } from './serviceCatalog'
import { Button, Text } from '@fluentui/react-northstar'


export default function Stages(props) {

    const [serviceCatalog] = useState(sc)
    const [stages, setStages] = useState([])
    const [value, setValue] = useState(0)
    const [options, setOptions] = useState([])
    const [hideTranslateDialog, setHideTranslateDialog] = useState(true)
    const [hideDocumentTranslateDialog, setHideDocumentTranslateDialog] = useState(true)
    const [hideFormRecDialog, setHideFormRecDialog] = useState(true)
    const [hideCustomNerDialog, setHideCustomNerDialog] = useState(true)
    const [hideCustomSingleDialog, setHideCustomSingleDialog] = useState(true)
    const [hideCustomMultiDialog, setHideCustomMultiDialog] = useState(true)
    const [hideHuggingFaceDialog, setHideHuggingFaceDialog] = useState(true)
    const [hideChangeDataDialog, setHideChangeDataDialog] = useState(true)
    const [hideToTxtDialog, setHideToTxtDialog] = useState(true)
    const [hideSttDialog, setHideSttDialog] = useState(true)
    const [currentOption, setCurrentOption] = useState(null)
    //const [price, setPrice] = useState(0)
    // const [numDocuments, setNumDocuments] = useState(0)
    // const [minutesPerAudioFile, setMinutesPerAudioFile] = useState(0)
    // const [pagesPerDocument, setPagesPerDocument] = useState(0)


    useEffect(() => {
        const getSC = async () => {
            const matchingOptions = getMatchingOptions({
                outputTypes: ["start"]
            })
            setOptions(matchingOptions)
        }
        getSC()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // useEffect(() => {
    //     setPrice(() => {
    //         if (stages && stages.length > 0) {
    //             let _price = 73 //cost of default service plan S1
    //             let _pages = 0
    //             if (stages[0].name === 'wav') { //best guess at audio to document conversion (1 hour = 30 pages)
    //                 const _hours = numDocuments * ((minutesPerAudioFile) / 60)
    //                 _pages = _hours * 30
    //             } else {
    //                 _pages = numDocuments * pagesPerDocument
    //             }
    //             for (const stage of stages) {
    //                 _price += stage.getPrice(_pages)
    //             }
    //             return _price
    //         }
    //         return 0
    //     })

    // }, [stages, numDocuments, minutesPerAudioFile, pagesPerDocument])

    const onDone = async () => {
        try {
            const currentPipelines = await axios.get('api/config?id=pipelines')
            for (const p of currentPipelines.data.pipelines) {
                if (p.name === props.selectedPipelineName) {
                    p.stages = stages.slice(1, stages.length)
                    break;
                }
            }
            await axios.post('/api/config', currentPipelines.data)
        } catch (err) {
            console.log(err)
        }

        props.onSelectContent({ currentTarget: { id: "CURRENT_PIPELINE" } })
        setOptions([])
    }

    const getMatchingOptions = (previousStage, allowAny) => {
        const _options = []
        for (const k in serviceCatalog) {
            for (const acceptedInputType of serviceCatalog[k].inputTypes) {
                if (acceptedInputType === "any" && allowAny) {
                    _options.push(serviceCatalog[k])
                    break;
                }
                if (previousStage.outputTypes.includes(acceptedInputType.toLowerCase())) {
                    _options.push(serviceCatalog[k])
                    break;
                }
            }
        }
        return _options
    }

    const onResetPipeline = () => {
        setStages([])
        const matchingOptions = getMatchingOptions({
            outputTypes: ["start"]
        })
        setOptions(matchingOptions)
    }

    const addItemToPipeline = (item) => {
        const _stages = _.cloneDeep(stages)
        const _event = _.cloneDeep(item)
        //in the case of 'any', copy the output type of the previous stage
        if (_event.outputTypes.includes('any')) {
            _event.outputTypes = _stages[_stages.length - 1].outputTypes
            _event.inputTypes = _stages[_stages.length - 1].outputTypes
        }
        _stages.push(_event)
        setStages(_stages)

        setOptions(getMatchingOptions(_event, true))
        setValue(value + 1)
    }


    const onItemClick = (event) => {
        console.log(event.name)
        if (event.name === 'translate') {
            setCurrentOption(_.cloneDeep(event))
            setHideTranslateDialog(false)
        } else if (event.name === 'documentTranslation') {
            setCurrentOption(_.cloneDeep(event))
            setHideDocumentTranslateDialog(false)
        } else if (event.name === 'totxt') {
            setCurrentOption(_.cloneDeep(event))
            setHideToTxtDialog(false)
        } else if (event.name === 'changeOutput') {
            setCurrentOption(_.cloneDeep(event))
            setHideChangeDataDialog(false)
        } else if (event.name === 'stt') {
            setCurrentOption(_.cloneDeep(event))
            setHideSttDialog(false)
        } else if (event.name === 'huggingFaceNER') {
            setCurrentOption(_.cloneDeep(event))
            setHideHuggingFaceDialog(false)
        } else if (event.name === 'customFormRec') {
            setCurrentOption(_.cloneDeep(event))
            setHideFormRecDialog(false)
        } else if (event.name === 'recognizeCustomEntities') {
            setCurrentOption(_.cloneDeep(event))
            setHideCustomNerDialog(false)
        } else if (event.name === 'singleCategoryClassify') {
            setCurrentOption(_.cloneDeep(event))
            setHideCustomSingleDialog(false)
        } else if (event.name === 'multiCategoryClassify') {
            setCurrentOption(_.cloneDeep(event))
            setHideCustomMultiDialog(false)
        } else {
            addItemToPipeline(event)
        }

    }

    const renderOptions = () => {
        if (options) {
            return (
                <div style={{ display: "flex", flexWrap: "wrap", padding: "30px", overflow: "auto", justifyContent: "center" }} >
                    {options.map((option) => {
                        return (<OptionCard option={option} onClickHandler={onItemClick} />)
                    })}
                </div>
            )
        }
    }

    const renderStageTop = () => {
        console.log(stages)
        let header
        if (!stages || stages.length === 0) {
            header = <Text weight="semibold" align="center" content="Select a document type to get started" style={{ fontSize: "18px", display: "block", width: "100%", marginBottom: "20px" }} />
        } else {
            header = <Text weight="semibold" align="center" content="Select a stage to add it to your pipeline configuration" style={{ fontSize: "18px", display: "block", width: "100%", marginBottom: "20px" }} />
        }

        return (
            <>
                {header}
                <LanguageSingleClassifyDialog hideDialog={hideCustomSingleDialog} setHideDialog={setHideCustomSingleDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <LanguageMultiClassifyDialog hideDialog={hideCustomMultiDialog} setHideDialog={setHideCustomMultiDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <LanguageCustomNerDialog hideDialog={hideCustomNerDialog} setHideDialog={setHideCustomNerDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <FormRecCustomDialog hideDialog={hideFormRecDialog} setHideDialog={setHideFormRecDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <LanguageDialog hideDialog={hideTranslateDialog} setHideDialog={setHideTranslateDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <DocumentTranslationDialog hideDialog={hideDocumentTranslateDialog} setHideDialog={setHideDocumentTranslateDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <HuggingFaceDialog hideDialog={hideHuggingFaceDialog} setHideDialog={setHideHuggingFaceDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <SpeechToTextDialog hideDialog={hideSttDialog} setHideDialog={setHideSttDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <ChangeDataDialog hideDialog={hideChangeDataDialog} setHideDialog={setHideChangeDataDialog} items={stages} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                <ToTxtDialog hideDialog={hideToTxtDialog} setHideDialog={setHideToTxtDialog} currentOption={currentOption} addItemToPipeline={addItemToPipeline} />
                {renderOptions(options)}
            </>
        )
    }

    // const estimatedPrice = () => {
    //     return <>Estimated Monthly Price (not including Cognitive Search): <span style={{ color: "blue" }}>${price}</span></>
    // }

    // const onNumDocuments = (event, value) => {
    //     isNumber = false
    //     try {
    //         // eslint-disable-next-line no-unused-vars
    //         const temp = Number(value)
    //         isNumber = true
    //     } catch (err) {

    //     }
    //     if (isNumber) {
    //         setNumDocuments(Number(value.value))
    //     }

    // }

    // const onMinutesPerAudioFile = (event, value) => {
    //     isNumber = false
    //     try {
    //         // eslint-disable-next-line no-unused-vars
    //         const temp = Number(value)
    //         isNumber = true
    //     } catch (err) {

    //     }
    //     if (isNumber) {
    //         setMinutesPerAudioFile(Number(value.value))
    //     }

    // }

    // const onPagesPerDocument = (event, value) => {
    //     isNumber = false
    //     try {
    //         // eslint-disable-next-line no-unused-vars
    //         const temp = Number(value)
    //         isNumber = true
    //     } catch (err) {

    //     }
    //     if (isNumber) {
    //         setPagesPerDocument(Number(value.value))
    //     }

    // }

    const legalMessage = "* Prices are estimates only and are not intended as actual price quotes. Actual pricing may vary depending on the type of agreement entered with Microsoft, date of purchase, and the currency exchange rate. Prices are calculated based on US dollars and converted using Thomson Reuters benchmark rates refreshed on the first day of each calendar month. Sign in to the Azure pricing calculator to see pricing based on your current program/offer with Microsoft. Contact an Azure sales specialist for more information on pricing or to request a price quote. See frequently asked questions about Azure pricing."

    const renderStageBottom = () => {
        if (stages && stages.length > 0) {
            return (
                <>
                    <Text weight="semibold" align="center" content="Pipeline Preview" style={{ fontSize: "18px", display: "block", width: "100%", marginBottom: "20px" }} />
                    <PipelinePreview stages={stages} />
                    <Prices stages={stages}></Prices>
                    <Text weight="light" content={legalMessage} style={{ fontSize: "13px", display: "block", width: "100%", marginBottom: "50px" }} />
                        
                    <div style={{
                        marginLeft: "700px",
                        marginBottom: "50px"
                    }}>
                        {/* {renderPriceInputs()} */}
                        
                        <Button onClick={onResetPipeline} content="Reset Pipeline" />{' '}
                        <Button onClick={onDone} content="Done" primary />{' '}
                    </div>

                </>
            )
        }
    }

    return (
        <div style={{ paddingLeft: "10px", paddingTop: "50px" }}>
            {renderStageTop()}
            {renderStageBottom()}
        </div>
    )
}