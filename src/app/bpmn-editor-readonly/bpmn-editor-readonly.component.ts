import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  OnInit,
  AfterContentInit,
  EventEmitter,
  Output
} from "@angular/core";
import $ from "jquery";
import * as BpmnJS from "bpmn-js/dist/bpmn-viewer.development.js";

@Component({
  selector: 'app-bpmn-editor-readonly',
  templateUrl: './bpmn-editor-readonly.component.html',
  styleUrls: ['./bpmn-editor-readonly.component.css']
})
export class BpmnEditorReadonlyComponent implements OnInit, OnDestroy, AfterContentInit {
  private bpmnModeler: BpmnJS;
  private initialDiagram: string | ArrayBuffer = "";
  private overlayHTMLForPinData: string = `
    <div class="card overlay-card-note" style="width: 300px;">
        <i id="closeOverlayNote" class="fas fa-times"></i>
        <div class="card-body">
            <div class="form-group">
                <input class="form-control" placeholder="You can provide your Pin URL here" />
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="You can provide your Pin URL here" />
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="You can provide your Pin URL here" />
            </div>
            <button class="btn btn-success float-right savePinDetails">Save</button>
        </div>
    </div>`;
  private overlayHTMLForNoteData: string = `
    <div class="card overlay-card-note-data" style="width: 300px;">
        <i class="fas fa-times" id="closeOverlayNoteData"></i>
        <div class="card-body">
            <div class="form-group url-field">
                <label>URL</label>
                <input type="text" class="form-control" placeholder="Provide URL here" />
            </div>
            <div class="form-group">
                <label>Some Label</label>
                <input type="text" class="form-control" placeholder="Provide Data here" />
            </div>
            <div class="form-group">
                <label>Note</label>
                <textarea class="form-control" placeholder="You can provide your note here"></textarea>
            </div>
            <button class="btn btn-success float-right saveNoteDetails">Save</button>
        </div>
    </div>`;
  private overlayHTMLForPin: string = `
    <button class="btn btn-primary overlay-pin">
        <span>Add Pin</span> 
        <i class="fas fa-thumbtack"></i>
    </button>`;
  private overlayHTMLForAddNote: string = `
    <button class="btn btn-primary overlay-add-note">
        Add More Info
    </button>`;

  @ViewChild("ref", { static: true }) private el: ElementRef;

  constructor() {
    this.bpmnModeler = new BpmnJS();

    var activeXML = sessionStorage.getItem("activeXML");
    if (activeXML !== null) {
      this.initialDiagram = activeXML;
    }

    this.bpmnModeler.on('import.done', ({ error }) => {
      if (!error) {
        this.bpmnModeler.get('canvas').zoom('fit-viewport');
      }

      var downloadBPMNEle = document.getElementById("downloadBPMN");
      if (downloadBPMNEle.classList.contains("disabled-btn")) {
        downloadBPMNEle.classList.remove("disabled-btn");
      }
    });
    
    this.bpmnModeler.on('commandStack.changed', function() {
      var downloadBPMNEle = document.getElementById("downloadBPMN");
      if (downloadBPMNEle.classList.contains("disabled-btn")) {
        downloadBPMNEle.classList.remove("disabled-btn");
      }
    });

    var canvas = this.bpmnModeler.get('canvas');
    var eventBus = this.bpmnModeler.get('eventBus');
    
    // you may hook into any of the following events
    var events = [
        'element.hover',
        'element.out',
        'element.click',
        'element.dblclick',
        'element.mousedown',
        'element.mouseup'
    ];

    events.forEach((event) => {
        eventBus.on(event, (e) => {
            // e.element = the model element
            // e.gfx = the graphical element
            // console.log(event, 'on', e);
            if (event === 'element.hover') {
                if (e.element.parent) {
                    // attach an overlay to a node
                    if ($('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-note').length < 1) {
                        this.addCustomOverlayElements(e.element.id, -30, -50, this.overlayHTMLForAddNote, 'add-note');
                        this.addCustomOverlayElements(e.element.id, 0, -50, this.overlayHTMLForPin, 'pin');
                        this.addCustomOverlayElements(e.element.id, -40, -120, this.overlayHTMLForPinData, 'note');
                        this.addCustomOverlayElements(e.element.id, -40, -120, this.overlayHTMLForNoteData, 'add-note-data');
                        $('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-add-note-data').hide();
                        $('.djs-overlays[data-container-id=' + e.element.id + ']').find('.djs-overlay-note').hide();
                    }
                }
            }
            if (event === 'element.click') {
                $('.djs-overlays').removeClass('show-overlay-note');
                $('.djs-overlays').removeClass('show-overlay-add-note');
                if (e.element.parent) {
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

    $(document).on('click', '.overlay-pin', function(e) {
      // $('#addPinModal').modal('show');
      $('.djs-overlays').removeClass('show-overlay-note');
      $('.djs-overlays').removeClass('show-overlay-add-note');
      $(this).parent().parent().toggleClass('show-overlay-note');
    });

    $(document).on('click', '#closeOverlayNote', function() {
      $(this).parent().parent().parent().removeClass('show-overlay-note');
    });

    $(document).on('click', '.overlay-add-note', function (e) {
      $('.djs-overlays').removeClass('show-overlay-note');
      $('.djs-overlays').removeClass('show-overlay-add-note');
      $(this).parent().parent().toggleClass('show-overlay-add-note');
    });

    $(document).on('click', '#closeOverlayNoteData', function () {
      $(this).parent().parent().parent().removeClass('show-overlay-add-note');
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
      var pinData = values.length > 0 ? values.join(";") : null;
      var data = {
          ShapeId: shapeId,
          PinData: pinData,
          PinType: "Pin",
      };
      if (data !== null) {
          // addPinDetailsToDB(data);
      }

  });

  var canvas = this.bpmnModeler.get('canvas');
  $(document).on('click', '.saveNoteDetails', function () {
      debugger;
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
      var PinData = values.map(val => val["value"]).length > 0 ? values.map(val => val["value"]).join(";") : null;
      var data = {
          ShapeId: shapeId,
          PinData: PinData,
          PinType: "Note",
      };
      if (data !== null) {
          // addPinDetailsToDB(data);
      }
    });
  }

  ngOnInit(): void {
    this.bpmnModeler.attachTo(this.el.nativeElement);
    // this.bpmnModeler.get('keyboard').bind(document);
  }

  ngAfterContentInit(): void {
    // var poweredByEle = document.getElementsByClassName("bjs-powered-by");
    // if (poweredByEle.length > 0) {
    //   poweredByEle[0].remove();
    // }

    if (this.initialDiagram !== "") {
      this.openDiagram(this.initialDiagram);
    }
  }

  ngOnDestroy(): void {
    this.bpmnModeler.destroy();
  }

  // handler functions
  createNewDiagramHandler() {
    this.openDiagram(this.initialDiagram);
  }

  downloadDiagramHandler() {
    this.exportDiagram();
  }

  // helper functions
  openExistingDiagramHandler(event) {
    event.preventDefault();

    var files = event.target.files;
    var file = files[0];

    var reader = new FileReader();
    
    reader.onload = evt => {
      var xml = evt.target["result"];
      if (xml !== "") {
        this.initialDiagram = xml;
        this.openDiagram(xml);
      }
    };

    reader.readAsText(file);
    // this.bpmnModeler.get("zoomScroll").reset();
  }

  openDiagram(xml) {
    this.bpmnModeler.importXML(xml, function (err) {
      if (err) {
        console.error(err);
      } else {
        //debugger;
        // var canvas = this.bpmnModeler.get("canvas");
        // canvas.zoom("fit-viewport");
      }
    });
  }

  exportDiagram() {
    this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
        if (err) {
            return console.error('could not save BPMN 2.0 diagram', err);
        }
        const filename = 'export-diagram.xml';
        const pom = document.createElement('a');
        const blob = new Blob([xml], { type: 'text/plain' });
        pom.setAttribute('href', window.URL.createObjectURL(blob));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
        pom.draggable = true;
        pom.click();
    });
  }

  addCustomOverlayElements(elementId, pB, pL, overlayHTML, type) {
    this.bpmnModeler.get('overlays').add(elementId, type, {
      position: {
          bottom: pB,
          left: pL,
      },
      html: overlayHTML
    });
  }

}
