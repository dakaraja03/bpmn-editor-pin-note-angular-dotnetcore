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
import * as BpmnJS from "bpmn-js/dist/bpmn-modeler.development.js";

@Component({
  selector: "app-bpmn-editor",
  templateUrl: "./bpmn-editor.component.html",
  styleUrls: ["./bpmn-editor.component.css"],
})
export class BpmnEditorComponent implements OnInit, OnDestroy, AfterContentInit {
  private bpmnModeler: BpmnJS;
  private initialDiagram: string | ArrayBuffer = `
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
  private isModelerChanged: boolean = false;

  @ViewChild("ref", { static: true }) private el: ElementRef;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();

  constructor() {
    if (sessionStorage.getItem("activeXML") !== null) {
      sessionStorage.removeItem("activeXML")
    }

    this.bpmnModeler = new BpmnJS();

    this.bpmnModeler.on('import.done', ({ error }) => {
      if (!error) {
        this.bpmnModeler.get('canvas').zoom('fit-viewport');
      }

      // var downloadBPMNEle = document.getElementById("downloadBPMN");
      // if (downloadBPMNEle.classList.contains("disabled-btn")) {
      //   downloadBPMNEle.classList.remove("disabled-btn");
      // }

      var ulEle = document.getElementsByClassName("download-diagram");
      var liEle = null;

      if (ulEle.length > 0) {
        liEle = ulEle[0].children;
      }
      if (liEle !== null  && liEle.length > 0) {
        for (var i = 0; i < liEle.length; i++) {
          if (liEle[i].classList.contains("disabled-btn")) {
            liEle[i].classList.remove("disabled-btn");
          }
        }
      }
    });
    
    this.bpmnModeler.on('commandStack.changed', function() {
      // var downloadBPMNEle = document.getElementById("downloadBPMN");
      // if (downloadBPMNEle.classList.contains("disabled-btn")) {
      //   downloadBPMNEle.classList.remove("disabled-btn");
      // }

      // var ulEle = document.getElementsByClassName("download-diagram");
      // var liEle = null;

      // if (ulEle.length > 0) {
      //   liEle = ulEle[0].children;
      // }
      // if (liEle.length > 0) {
      //   for (var i = 0; i < liEle.length; i++) {
      //     if (liEle[i].classList.contains("disabled-btn")) {
      //       liEle[i].classList.remove("disabled-btn");
      //     }
      //   }
      // }
    });
  }

  ngOnInit(): void {
    this.bpmnModeler.attachTo(this.el.nativeElement);
    this.bpmnModeler.get('keyboard').bind(document);
  }

  ngAfterContentInit(): void {
    // var poweredByEle = document.getElementsByClassName("bjs-powered-by");
    // if (poweredByEle.length > 0) {
    //   poweredByEle[0].remove();
    // }

    // if (this.initialDiagram !== "") {
    //   this.openDiagram(this.initialDiagram);
    // }
  }

  ngOnDestroy(): void {
    this.bpmnModeler.destroy();
  }

  createNewDiagramHandler() {
    this.isModelerChanged = true;
    this.openDiagram(this.initialDiagram);
  }

  downloadDiagramHandler() {
    var prompt = window.prompt("Enter name of file, to save", "export-diagram");

    if (prompt !== null || prompt !== "") {
      var diagramName = prompt;
      this.exportDiagram(diagramName);
    }
  }

  downloadDiagramasSVGHandler() {
    this.exportDigramSVG();
  }

  openExistingDiagramHandler(event) {
    this.isModelerChanged = true;
    event.preventDefault();

    var files = event.target.files;

    if (files.length > 0) {
      var file = files[0];  

      var reader = new FileReader();
      
      reader.onload = evt => {
        var xml = evt.target["result"];
        if (xml !== "") {
          // this.initialDiagram = xml;
          this.openDiagram(xml);
        }
      };

      reader.readAsText(file);
    }
  }

  switchToReadonlyModeHandler() {
    if (this.isModelerChanged) {
      this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
        if (err) {
            return console.error("could not save BPMN 2.0 diagram", err);
        }
        if (xml) {
            sessionStorage.setItem("activeXML", xml);
        }
      });
    }
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

  exportDiagram(diagramName = "export-diagram") {
    this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
        if (err) {
            return console.error('could not save BPMN 2.0 diagram', err);
        }
        const fileFormat = ".xml";
        const filename = diagramName + fileFormat;
        const pom = document.createElement('a');
        const blob = new Blob([xml], { type: 'text/plain' });
        pom.setAttribute('href', window.URL.createObjectURL(blob));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
        pom.draggable = true;
        pom.click();
    });
  }

  exportDigramSVG() {
    this.bpmnModeler.saveSVG(function(err, svg) {
      if (err) {
        return console.error('could not save BPMN 2.0 diagram', err);
      }
      const filename = 'export-diagram.svg';
      const pom = document.createElement('a');
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      pom.setAttribute('href', window.URL.createObjectURL(blob));
      pom.setAttribute('download', filename);
      pom.dataset.downloadurl = ['image/svg+xml', pom.download, pom.href].join(':');
      pom.draggable = true;
      pom.click();
    });
  }

}
