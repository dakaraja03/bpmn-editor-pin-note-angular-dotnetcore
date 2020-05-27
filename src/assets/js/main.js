$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    var preDefinedDiagram = [
        {
            name: 'Sample 1',
            url: 'https://gieom-drawing-tool.web.app/assets/resources/MainProzess.bpmn'
        },
        {
            name: 'Sample 2',
            url: 'https://raw.githubusercontent.com/bpmn-miwg/bpmn-miwg-test-suite/master/Reference/A.1.0.bpmn'
        },
        {
            name: 'Sample 3',
            url: 'https://raw.githubusercontent.com/bpmn-miwg/bpmn-miwg-test-suite/master/Reference/A.2.0.bpmn'
        },
        {
            name: 'Sample 4',
            url: 'https://raw.githubusercontent.com/bpmn-miwg/bpmn-miwg-test-suite/master/Reference/A.2.1.bpmn'
        },
        {
            name: 'Sample 5',
            url: 'https://raw.githubusercontent.com/bpmn-miwg/bpmn-miwg-test-suite/master/Reference/A.3.0.bpmn'
        },
        {
            name: 'Sample 6',
            url: 'https://raw.githubusercontent.com/bpmn-miwg/bpmn-miwg-test-suite/master/Reference/A.4.0.bpmn'
        },
        {
            name: 'Sample 7',
            url: 'https://raw.githubusercontent.com/bpmn-miwg/bpmn-miwg-test-suite/master/Reference/A.4.1.bpmn'
        }
    ];
    var diagramUrl;
    var emptyDiagram = `
        <?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_03c3xi1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="5.1.2">
        <bpmn:process id="Process_0gv1hwp" isExecutable="false">
            <bpmn:startEvent id="StartEvent_1bm324f" />
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0gv1hwp">
            <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1bm324f">
                <dc:Bounds x="242" y="184" width="36" height="36" />
            </bpmndi:BPMNShape>
            </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
        </bpmn:definitions>`;
    // modeler instance
    var bpmnModeler = new BpmnJS({
        container: '#canvas',
        keyboard: {
            bindTo: window
        }
    });
    var overlayHTMLForPinData = `
                <div class="card overlay-card-note" style="width: 300px;">
                    <i id="closeOverlayNote" class="fas fa-times"></i>
                    <div class="card-body">
                        <div class="form-group">
                            <input id="pin-input1" class="form-control" placeholder="You can provide your Pin URL here" />
                        </div>
                        <div class="form-group">
                            <input id="pin-input2" class="form-control" placeholder="You can provide your Pin URL here" />
                        </div>
                        <div class="form-group">
                            <input id="pin-input3" class="form-control" placeholder="You can provide your Pin URL here" />
                        </div>
                        <button class="btn btn-success float-right savePinDetails">Save</button>
                    </div>
                </div>
            `;
    var overlayHTMLForNoteData = `
                <div class="card overlay-card-note-data" style="width: 300px;">
                    <i class="fas fa-times" id="closeOverlayNoteData"></i>
                    <div class="card-body">
                        <div class="form-group url-field">
                            <label>URL</label>
                            <input id="note-input1" type="text" class="form-control" placeholder="Provide URL here" />
                        </div>
                        <div class="form-group">
                            <label>Some Label</label>
                            <input id="note-input2" type="text" class="form-control" placeholder="Provide Data here" />
                        </div>
                        <div class="form-group">
                            <label>Note</label>
                            <textarea id="note-textarea" class="form-control" placeholder="You can provide your note here"></textarea>
                        </div>
                        <button class="btn btn-success float-right saveNoteDetails">Save</button>
                    </div>
                </div>
            `;
    var overlayHTMLForPin = `
        <button class="btn btn-primary overlay-pin">
            <span>Add Pin</span> 
            <i class="fas fa-thumbtack"></i>
        </button>`;
    var overlayHTMLForAddNote = `
        <button class="btn btn-primary overlay-add-note">
            Add More Info
        </button>`;
    var selectedElement = null;
    
    /**
     * Save diagram contents and print them to the console.
     */
    function exportDiagram() {

        bpmnModeler.saveXML({ format: true }, function (err, xml) {
            if (err) {
                return console.error('could not save BPMN 2.0 diagram', err);
            }
            debugger;
            console.log('DIAGRAM', xml);
            const filename = 'export.xml';
            const pom = document.createElement('a');
            const blob = new Blob([xml], { type: 'text/plain' });
            pom.setAttribute('href', window.URL.createObjectURL(blob));
            pom.setAttribute('download', filename);
            pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
            pom.draggable = true;
            pom.click();
        });
    }

    /**
     * Open diagram in our modeler instance.
     *
     * @param {String} bpmnXML diagram to display
     */
    function openDiagram(bpmnXML) {
        
        // import diagram
        bpmnModeler.importXML(bpmnXML, function (err) {
            console.log('Some event happened');
            if (err) {
                return console.error('could not import BPMN 2.0 diagram', err);
            }
            // access modeler components
            var canvas = bpmnModeler.get('canvas');
            //Overlay events
            var eventBus = bpmnModeler.get('eventBus');
            // get all Elements
            var elementRegistry = bpmnModeler.get("elementRegistry");
            var elements = elementRegistry.filter(function(element) {
                return element.parent && element;
            });
            // elements.forEach(function(element) {
            //     addPinAndNoteOverlays(element);// while importing xml file, add Pin and Note details
            // });

            // you may hook into any of the following events
            var events = [
                'element.hover',
                'element.out',
                'element.click',
                'element.dblclick',
                'element.mousedown',
                'element.mouseup'
            ];
            events.forEach(function (event) {

                eventBus.on(event, function (e) {
                    // e.element = the model element
                    // e.gfx = the graphical element
                    // console.log(event, 'on', e);
                    if (event === 'element.hover') {
                        if (e.element.parent) {
                            // attach an overlay to a node
                            if ($('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-note').length < 1) {
                                addCustomOverlayElements(e.element.id, -30, -50, overlayHTMLForAddNote, 'add-note');
                                addCustomOverlayElements(e.element.id, 0, -50, overlayHTMLForPin, 'pin');
                                addCustomOverlayElements(e.element.id, -40, -120, overlayHTMLForPinData, 'note');
                                addCustomOverlayElements(e.element.id, -40, -120, overlayHTMLForNoteData, 'add-note-data');
                                $('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-add-note-data').hide();
                                $('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-note').hide();
                            }
                        }
                    }
                    if (event === 'element.click') {
                        $('.djs-overlays').removeClass('show-overlay-note');
                        $('.djs-overlays').removeClass('show-overlay-add-note');
                        if (e.element.parent) {
                            selectedElement = e.element;
                            if ($('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-note').find('input').val().length > 0) {
                                $('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-pin').addClass('show-pin');
                            }
                            if ($('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-add-note-data').find('textarea').val().length > 0) {
                                $('.djs-overlays').removeClass('show-overlay-add-note');
                                $('.djs-overlays[data-container-id=' + e.element.id + ']').addClass('show-overlay-add-note');
                                canvas.addMarker(e.element.id, 'needs-discussion');
                            }
                        }
                    }
                });
            });
            // zoom to fit full viewport
            canvas.zoom('fit-viewport');
        });
    }

    // bpmnModeler.get('eventBus').on('shape.added', function(event) {
    //     var element = event.element;
    // });

    function addPinAndNoteOverlays(element) {
        if (element.businessObject.get('documentation').length <= 0) {
           return;
        }

        var pinComments = getComments(element, "pin");
        var noteComments = getComments(element, "note");

        addPinAndNoteCommentsOverlay(element, pinComments, noteComments);
    }

    function addPinAndNoteCommentsOverlay(element, pinComments, noteComments) {
        if (pinComments.length > 0 || noteComments.length > 0) {
            // attach an overlay to a node
            if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').length < 1) {
                addCustomOverlayElements(element.id, -30, -50, overlayHTMLForAddNote, 'add-note');
                addCustomOverlayElements(element.id, 0, -50, overlayHTMLForPin, 'pin');
                addCustomOverlayElements(element.id, -40, -120, overlayHTMLForPinData, 'note');
                addCustomOverlayElements(element.id, -40, -120, overlayHTMLForNoteData, 'add-note-data');
                $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').hide();
                $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').hide();

                $('.djs-overlays').removeClass('show-overlay-note');
                $('.djs-overlays').removeClass('show-overlay-add-note');

                if (element.parent) {
                    var pinInputs = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input');

                    if (pinComments.length <= pinInputs.length) {
                        for (var i = 0; i < pinInputs.length; i++) {
                            for (var j = 0; j < pinComments.length; j++) {
                                var inputId = pinInputs[i]["id"];
                                var commentId = pinComments[j].split(",")[0]; // 0 index is Input ele id

                                if (inputId === commentId) {
                                    pinInputs[i]["value"] = pinComments[j].split(",")[1]; // 1 index is Input value
                                    break;
                                }
                            }
                        }
                    }
                    
                    if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').val().length > 0) {
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-pin').addClass('show-pin');
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('button').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').parent().addClass('disable-field');
                    }

                    var noteInputs = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('input');
                    var noteTextarea = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea');

                    for (var i = 0; i < noteComments.length; i++) {
                        for (var j = 0; j < noteInputs.length; j++) {
                            var noteCommentId = noteComments[i].split(",")[0]; // 0 index is Input ele id
                            var noteInputId = noteInputs[j]["id"];

                            if (noteCommentId === noteInputId) {
                                noteInputs[j]["value"] = noteComments[i].split(",")[1]; // 1 index is Input value
                                break;
                            }
                        }
                        if (noteComments[i].split(",")[0] === noteTextarea.attr("id")) {
                            noteTextarea.val(noteComments[i].split(",")[1]);
                        }
                    }

                    if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea').val().length > 0) {
                        $('.djs-overlays').removeClass('show-overlay-add-note');
                        $('.djs-overlays[data-container-id=' + element.id + ']').addClass('show-overlay-add-note');
                        bpmnModeler.get('canvas').addMarker(element.id, 'needs-discussion');

                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('.card-body').addClass('disable-field');
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('input').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('button').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note').hide();
                    }
                }
            }
        }
    }

    
    function addPinAndNoteCommentsOverlay2(element, pinComments, noteComments) {
        if (pinComments.length > 0 || noteComments.length > 0) {
            // attach an overlay to a node
            if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').length < 1) {
                addCustomOverlayElements(element.id, -30, -50, overlayHTMLForAddNote, 'add-note');
                addCustomOverlayElements(element.id, 0, -50, overlayHTMLForPin, 'pin');
                addCustomOverlayElements(element.id, -40, -120, overlayHTMLForPinData, 'note');
                addCustomOverlayElements(element.id, -40, -120, overlayHTMLForNoteData, 'add-note-data');
                $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').hide();
                $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').hide();

                $('.djs-overlays').removeClass('show-overlay-note');
                $('.djs-overlays').removeClass('show-overlay-add-note');

                if (element.parent) {
                    var pinInputs = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input');

                    if (pinComments.length >= pinInputs.length) {
                        for (var i = 0; i < pinInputs.length; i++) {    
                            pinInputs[i]["value"] = pinComments[i];
                        }
                    }
                    
                    if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').val().length > 0) {
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-pin').addClass('show-pin');
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('button').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').parent().addClass('disable-field');
                    }

                    var noteInputs = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('input');
                    var noteTextarea = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea');

                    if (noteComments.length >= noteInputs.length) {
                        for (var i = 0; i < noteInputs.length; i++) {
                            noteInputs[i]["value"] = noteComments[i];
                        }
                    }
                    if (noteComments.length === 3) {
                        noteTextarea.val(noteComments[noteComments.length - 1]);
                    }

                    if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea').val().length > 0) {
                        $('.djs-overlays').removeClass('show-overlay-add-note');
                        $('.djs-overlays[data-container-id=' + element.id + ']').addClass('show-overlay-add-note');
                        bpmnModeler.get('canvas').addMarker(element.id, 'needs-discussion');

                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('.card-body').addClass('disable-field');
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('input').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('button').prop('disabled', true);
                        $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note').hide();
                    }
                }
            }


            // if (pinType === "Pin") {
            //     if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').length < 1) {
            //         addCustomOverlayElements(element.id, 0, -50, overlayHTMLForPin, 'pin');
            //         addCustomOverlayElements(element.id, -30, -50, overlayHTMLForAddNote, 'add-note');
            //         addCustomOverlayElements(element.id, -40, -120, overlayHTMLForPinData, 'note');
            //         $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').hide();

            //         $('.djs-overlays').removeClass('show-overlay-note');
            //         $('.djs-overlays').removeClass('show-overlay-add-note');

            //         if (element.parent) {
            //             var pinInputs = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input');

            //             if (comments.length <= pinInputs.length) {
            //                 for (var i = 0; i < pinInputs.length; i++) {    
            //                     pinInputs[i]["value"] = comments[i];
            //                 }
            //             }
                        
            //             if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').val().length > 0) {
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-pin').addClass('show-pin');
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').prop('disabled', true);
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-note').find('input').parent().addClass('disable-field');
            //             }
            //         }
            //     }
            // }
            // if (pinType === "Note") {
            //     if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').length < 1) {
            //         addCustomOverlayElements(element.id, 0, -50, overlayHTMLForPin, 'pin');
            //         addCustomOverlayElements(element.id, -30, -50, overlayHTMLForAddNote, 'add-note');
            //         addCustomOverlayElements(element.id, -40, -120, overlayHTMLForNoteData, 'add-note-data');
            //         $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').hide();

            //         $('.djs-overlays').removeClass('show-overlay-note');
            //         $('.djs-overlays').removeClass('show-overlay-add-note');

            //         if (element.parent) {
            //             var noteInputs = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('input');
            //             var noteTextarea = $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea');

            //             for (var i = 0; i < noteInputs.length; i++) {
            //                 noteInputs[i]["value"] = comments[i];
            //             }
            //             if (comments.length === 3) {
            //                 noteTextarea.val(comments[comments.length - 1]);
            //             }

            //             if ($('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea').val().length > 0) {
            //                 $('.djs-overlays').removeClass('show-overlay-add-note');
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').addClass('show-overlay-add-note');
            //                 bpmnModeler.get('canvas').addMarker(element.id, 'needs-discussion');

            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('.card-body').addClass('disable-field');
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('input').prop('disabled', true);
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note-data').find('textarea').prop('disabled', true);
            //                 $('.djs-overlays[data-container-id=' + element.id + ']').find('.djs-overlay-add-note').hide();
            //             }
            //         }
            //     }
            // }
        }
    }

    var overlays = bpmnModeler.get('overlays');
    function addCustomOverlayElements(elementId, pB, pL, overlayHTML, type) {
        overlays.add(elementId, type, {
            position: {
                bottom: pB,
                left: pL,
            },
            html: overlayHTML
        });
    }

    (function insertSampleToModal() {
        for (var i = 0; i < preDefinedDiagram.length; i++) {
            $('#sampleItemList').append(`<li class="list-group-item" style="cursor: pointer" data-url="${preDefinedDiagram[i].url}">${preDefinedDiagram[i].name}</li>`);
        }
    }());

    if (sessionStorage.getItem('activeXML') != null) {
        openDiagram(sessionStorage.getItem('activeXML'));
    }

    $(document).on('click', '#sampleItemList li', function () {
        $.get($(this).attr('data-url'), openDiagram, 'text');
        $('#insertSampleModal').modal('hide');
    })

    $(document).on('click', '.overlay-pin', function(e) {
        $('#addPinModal').modal('show');
        // $('.djs-overlays').removeClass('show-overlay-note');
        // $('.djs-overlays').removeClass('show-overlay-add-note');
        // $(this).parent().parent().toggleClass('show-overlay-note');
    });

    $(document).on('click', '#closeOverlayNote', function() {
        $(this).parent().parent().parent().removeClass('show-overlay-note');
    });

    $(document).on('click', '.overlay-add-note', function (e) {
        $('.djs-overlays').removeClass('show-overlay-note');
        $('.djs-overlays').removeClass('show-overlay-add-note');
        $(this).parent().parent().toggleClass('show-overlay-add-note');
    });

    // load external diagram file via AJAX and open it
    $('#importBPMN').change(function(event) {
        var tmppath = URL.createObjectURL(event.target.files[0]);
        diagramUrl = tmppath;
        $.get(diagramUrl, openDiagram, 'text');

        // add overlays
        var elementRegistry = bpmnModeler.get("elementRegistry");
        var pinResult;
        getPinDetailsFromDB().then(function(result) {
            pinResult = result !== null ? result : [];
            console.log("pinResult", pinResult);
            pinResult = removeDuplicatetElements(pinResult)

            for (var i = 0; i < pinResult.length; i++) {
                var element = elementRegistry.get(pinResult[i].shapeId);
                var pinComments = pinResult[i].comments.hasOwnProperty("pin") ? pinResult[i].comments.pin.split(";") : [];
                var noteComments = pinResult[i].comments.hasOwnProperty("note") ? pinResult[i].comments.note.split(";") : [];

                if (element) {
                    addPinAndNoteCommentsOverlay2(element, pinComments, noteComments)  
                }

            }
        });
    });

    function removeDuplicatetElements(arrayObjs) {
        var distinctObj = {}; 
        var distinctEle = [];

        for (var i = 0; i < arrayObjs.length; i++) {
            var comments = {};
            comments[arrayObjs[i].pinType.toLowerCase()] = arrayObjs[i].pinData;

            if (distinctObj.hasOwnProperty(arrayObjs[i]["shapeId"])) {
                if(!distinctObj[arrayObjs[i]["shapeId"]]["comments"].hasOwnProperty(arrayObjs[i].pinType.toLowerCase())) {
                    distinctObj[arrayObjs[i]["shapeId"]]["comments"][arrayObjs[i].pinType.toLowerCase()] = arrayObjs[i].pinData;
                }
            }
            else {
                distinctObj[arrayObjs[i]["shapeId"]] = {
                    createdBy: arrayObjs[i].createdBy,
                    createdDate: arrayObjs[i].createdDate,
                    modifiedBy: arrayObjs[i].modifiedBy,
                    modifiedDate: arrayObjs[i].modifiedDate,
                    objectId: arrayObjs[i].objectId,
                    shapeId: arrayObjs[i].shapeId,
                    comments: comments
                };
            }
        }
        for (let key in distinctObj) {
            distinctEle.push(distinctObj[key]);
        }

        return distinctEle;
    }

    $('#importEmptyDiagram').click(function () {
        openDiagram(emptyDiagram);
    });

    $('#downloadBPMN').click(function () {
        exportDiagram();
    });

    $('#viewSwitcher').click(function() {
        bpmnModeler.saveXML({ format: true }, function (err, xml) {
            if (err) {
                return console.error('could not save BPMN 2.0 diagram', err);
            }
            if(xml) {
                sessionStorage.setItem('activeXML', xml);
                window.location.href = window.location.origin + '/viewer.html';
            }
        });
    });

    $(document).on('click', '.disable-field', function() {
        window.open(
            $(this).find('input').val(),
            '_blank'
        );
    });

    $(document).on('click', '.savePinDetails', function() {
        debugger;
        var item = $(this).parent().find('input');
        var values = [];
        $(this).parent().parent().parent().parent().find('.djs-overlay-pin').addClass('show-pin');
        $(this).prop('disabled', true);
        for (var i = 0; i < item.length; i++) {
            if ($(item[i]).val().length > 0) {
                $(item[i]).prop('disabled', true);
                $(item[i]).parent().addClass('disable-field');
                
                values.push($(item[i]).val());
                var id = $(item[i]).attr("id");
                var value = $(item[i]).val();

                // if (selectedElement) {
                //     addComment(selectedElement, id, value, "pin"); // add Pin details to xml file
                // }
            }
        }

        var shapeId = $(this).parent().parent().parent().parent().attr("data-container-id") ? $(this).parent().parent().parent().parent().attr("data-container-id") : null;
        var values = values.length > 0 ? values.join(";") : null;
        var data = {
            ShapeId: shapeId,
            PinData: values,
            PinType: "Pin",
        };
        if (data !== null) {
            addPinDetailsToDB(data);
        }

    });

    $(document).on('click', '.saveNoteDetails', function () {
        debugger;
        var canvas = bpmnModeler.get('canvas');
        $(this).parent().addClass('disable-field');
        $(this).parent().find('input').prop('disabled', true);
        $(this).parent().find('textarea').prop('disabled', true);
        $(this).parent().parent().parent().parent().find('.djs-overlay-add-note').hide();
        canvas.addMarker($(this).parent().parent().parent().parent().attr('data-container-id'), 'needs-discussion');
        $(this).prop('disabled', true);

        var values = [];
        var item = $(this).parent().find('input');
        var textarea = $(this).parent().find('textarea');

        for (var i = 0; i < item.length; i++) {
            if ($(item[i]).val().length > 0) {
                values.push({
                    "id": $(item[i]).attr("id"),
                    "value": $(item[i]).val(),
                });
            }
        }
        if(textarea){
            values.push({
                "id": textarea.attr("id"),
                "value": textarea.val(),
            });
        }

        // for(var i = 0; i < values.length; i++) {
        //     if (selectedElement) {
        //         addComment(selectedElement, values[i]["id"], values[i]["value"], "note"); // add NotePin details to xml file
        //     }
        // }

        var shapeId = $(this).parent().parent().parent().parent().attr('data-container-id') ? $(this).parent().parent().parent().parent().attr('data-container-id') : null;
        var values = values.map(val => val["value"]).length > 0 ? values.map(val => val["value"]).join(";") : null;
        var data = {
            ShapeId: shapeId,
            PinData: values,
            PinType: "Note",
        };
        if (data !== null) {
            addPinDetailsToDB(data);
        }
    });

    $(document).on('click', '#closeOverlayNoteData', function () {
        $(this).parent().parent().parent().removeClass('show-overlay-add-note');
    });

    function addPinDetailsToDB(data, url = "") {        
        url = "http://local.main.com/Node/AddPinDataBPMN";
        // url = "http://local.main.com/Node/GetPinDataBPMN?objectId=00000000-0000-0000-0000-000000000000";

        // fetch(url, {
        //     method: "POST",
        //     body: JSON.stringify(data)
        // })
        // .then(function(response) {
        //     return response.json();
        // })
        // .then(function(result) {
        //     console.log("result, ", result);
        // })
        // .catch(function(err) {
        //     console.log("error, ", err);
        // });

        $.ajax({
            type: "POST",
            url: url + "?parsedModel=" + JSON.stringify(data),
            // data: JSON.stringify(data),
            // contentType: "application/json",
            // headers: {
            //     "Cache-Control": "no-cache, no-store, proxy-revalidate, private, no-cache=Set-Cookie, pre-check=0, post-check=0, max-age=0, s-maxage=0",
            //     "Server": "GIEOM",
            //     "X-Frame-Options": "SAMEORIGIN",
            //     "X-XSS-Protection": "1; mode=block",
            //     "X-Content-Type-Options": "nosniff ",
            //     "Content-Security-Policy": "'self'",
            //     "Access-Control-Allow-Origin": "*",
            //     "Content-Type": "application/json; charset=utf-8"
            // },
            success: function (response) {
                console.log("success, ", response);
            },
            error: function (error) {
                console.log("error, ", error);
            }
        });
    }

    async function getPinDetailsFromDB(objectId = "", url = "") {       
        
        var queryParams = window.location.search.substring(1);
        var parameters = queryParams.split("=")
        var objectId = null;    
        if (parameters.length > 0) {
            if (parameters[0] === "objectId") {
                objectId = parameters[1]
            }
        }

        url = "http://local.main.com/Node/GetPinDataBPMN";
        var pinResult = null;

        var response = await fetch(url + "?objectId=" + objectId, {
            method: "GET"
        })
        var result = await response.json();
        pinResult = await result.length > 0 ? result : null;

        return pinResult;

        // $.ajax({
        //     type: "GET",
        //     url: url + "?objectId=" + objectId,
        //     async: true,
         
        //     success: function (response) {
        //         console.log("success, ", response);
        //         if (response.length > 0) {
        //             pinResult = response;
        //         }
        //     },
        //     error: function (error) {
        //         console.log("error, ", error);
        //     }
        // });
    }

});


var _getCommentsElement = function(element, create = false, type) {

    var bo = element.businessObject;

    var docs = bo.get('documentation');

    var comments;

    if(type === "pin") {
        // get comments node
        docs.some(function(d) {
            return d.textFormat === 'text/pin-comments' && (comments = d);
        });
    }
    if(type === "note") {
        // get comments node
        docs.some(function(d) {
            return d.textFormat === 'text/note-comments' && (comments = d);
        });
    }    

    // create if not existing
    if (!comments && create) {
        var comments;
        if(type === "pin") {
            comments = bo.$model.create('bpmn:Documentation', { textFormat: 'text/pin-comments' });   
        }
        if(type === "note") {
            comments = bo.$model.create('bpmn:Documentation', { textFormat: 'text/note-comments' });   
        } 
        docs.push(comments);
    }

    return comments;
};
  
var getComments = function(element, type) {
    var doc = this._getCommentsElement(element, false, type);

    if (!doc || !doc.text) {
        return [];
    } else {
        // return doc.text.split(/;\r?\n;/).map(function(str) {
        //     return str.split(/:/, 2);
        // });
        return doc.text.split(";");
    }
};
  
var setComments = function(element, comments, type) {
    var doc = this._getCommentsElement(element, true, type);
  
    // var str = comments.map(function(c) {
    //   return c.join(':');
    // }).join(';\n;');
  
    if(comments.length > 0)
        doc.text = comments.join(";");
};
  
var addComment = function(element, id, value, type) {
    var comments = this.getComments(element, type);
  
    comments.push([id, value]);
  
    this.setComments(element, comments, type);
};
  
  
var removeComment = function(element, comment) {
    var comments = this.getComments(element);
  
    var idx = -1;
  
    comments.some(function(c, i) {
  
      var matches = c[0] === comment[0] && c[1] === comment[1];
  
      if (matches) {
        idx = i;
      }
  
      return matches;
    });
  
    if (idx !== -1) {
      comments.splice(idx, 1);
    }
  
    this.setComments(element, comments);
};
  