"use strict";(self.webpackChunkTalentManagement=self.webpackChunkTalentManagement||[]).push([[592],{4788:(b,y,l)=>{l.d(y,{n:()=>m});class o{constructor(){this.toString=()=>this.paramsAndValues.join("&"),this.paramsAndValues=[]}push(n,t){t=encodeURIComponent(t.toString()),this.paramsAndValues.push([n,t].join("="))}}class g{constructor(n,t,e){this.baseUrl=n,this.action=t,this.url=[n,t].join("/"),this.queryString=e||new o}toString(){const n=this.queryString?this.queryString.toString():"";return n?`${this.url}?${n}`:this.url}}var h=l(8075),d=l(9212);let m=(()=>{class i{constructor(){this.getDataByIdEndpoint=t=>this.createUrlWithPathVariables("data",[t]),this.getDataByIdAndCodeEndpoint=(t,e)=>this.createUrlWithPathVariables("data",[t,e]),this.getNewsEndpoint=()=>this.createUrl("41gRGwOaw",!0),this.invalidUrlEndpoint=()=>this.createUrl("invalidurl",!0),this.getPositionByIdEndpoint=t=>this.createUrlWithPathVariables("Positions",[t]),this.deletePositionByIdEndpoint=t=>this.createUrlWithPathVariables("Positions",[t]),this.postPositionsPagedEndpoint=()=>this.createUrl("Positions/Paged"),this.postPositionsEndpoint=()=>this.createUrl("Positions"),this.putPositionsEndpoint=t=>this.createUrlWithPathVariables("Positions",[t]),this.postEmployeesPagedEndpoint=()=>this.createUrl("Employees/Paged"),this.getDepartmentsEndpoint=()=>this.createUrl("Departments"),this.getSalaryRangesEndpoint=()=>this.createUrl("SalaryRanges")}getDataByIdCodeAndYearEndpoint(t,e,r){const a=new o;return a.push("year",r),`${this.createUrlWithPathVariables("data",[t,e])}?${a.toString()}`}getProductListByCountryCodeEndpoint(t){return this.createUrlWithQueryParameters("productlist",e=>e.push("countryCode",t))}getProductListByCountryAndPostalCodeEndpoint(t,e){return this.createUrlWithQueryParameters("productlist",r=>{r.push("countryCode",t),r.push("postalCode",e)})}createUrl(t,e=!1){return new g(e?h.NZ.apiMockEndpoint:h.NZ.apiEndpoint,t).toString()}createUrlWithQueryParameters(t,e){const r=new g(h.NZ.apiEndpoint,t);return e&&e(r.queryString),r.toString()}createUrlWithPathVariables(t,e=[]){let r="";for(const s of e)null!==s&&(r+=`/${encodeURIComponent(s.toString())}`);return new g(h.NZ.apiEndpoint,`${t}${r}`).toString()}static#t=this.\u0275fac=function(e){return new(e||i)};static#e=this.\u0275prov=d.Yz7({token:i,factory:i.\u0275fac,providedIn:"root"})}return i})()},5821:(b,y,l)=>{l.d(y,{E:()=>h});var o=l(9212),g=l(9862);let h=(()=>{class d{constructor(i){this.http=i,this.get=(n,t)=>this.http.get(n,t),this.post=(n,t,e)=>this.http.post(n,t,e),this.put=(n,t,e)=>this.http.put(n,t,e),this.delete=(n,t)=>this.http.delete(n,t)}static#t=this.\u0275fac=function(n){return new(n||d)(o.LFG(g.eN))};static#e=this.\u0275prov=o.Yz7({token:d,factory:d.\u0275fac,providedIn:"root"})}return d})()},627:(b,y,l)=>{l.d(y,{G:()=>h,T:()=>m});var o=l(9212),h=function(){function i(n,t,e){this.el=n,this.vcr=t,this.renderer=e,this.dtOptions={}}return i.prototype.ngOnInit=function(){var n=this;this.dtTrigger?this.dtTrigger.subscribe(function(t){n.displayTable(t)}):this.displayTable(null)},i.prototype.ngOnDestroy=function(){this.dtTrigger&&this.dtTrigger.unsubscribe(),this.dt&&this.dt.destroy(!0)},i.prototype.displayTable=function(n){var t=this;n&&(this.dtOptions=n),this.dtInstance=new Promise(function(e,r){Promise.resolve(t.dtOptions).then(function(a){0===Object.keys(a).length&&0===$("tbody tr",t.el.nativeElement).length?r("Both the table and dtOptions cannot be empty"):setTimeout(function(){var p={rowCallback:function(f,c,v){if(a.columns){var u=a.columns;t.applyNgPipeTransform(f,u),t.applyNgRefTemplate(f,u,c)}a.rowCallback&&a.rowCallback(f,c,v)}};p=Object.assign({},a,p),t.dt=$(t.el.nativeElement).DataTable(p),e(t.dt)})})})},i.prototype.applyNgPipeTransform=function(n,t){t.filter(function(r){return r.ngPipeInstance&&!r.ngTemplateRef}).forEach(function(r){var a=r.ngPipeInstance,s=r.ngPipeArgs||[],p=t.filter(function(u){return!1!==u.visible}).findIndex(function(u){return u.data===r.data}),f=n.childNodes.item(p),c=$(f).text(),v=a.transform.apply(a,function(i,n,t){if(t||2===arguments.length)for(var a,e=0,r=n.length;e<r;e++)(a||!(e in n))&&(a||(a=Array.prototype.slice.call(n,0,e)),a[e]=n[e]);return i.concat(a||Array.prototype.slice.call(n))}([c],s,!1));$(f).text(v)})},i.prototype.applyNgRefTemplate=function(n,t,e){var r=this;t.filter(function(s){return s.ngTemplateRef&&!s.ngPipeInstance}).forEach(function(s){var p=s.ngTemplateRef,f=p.ref,c=p.context,v=t.filter(function(P){return!1!==P.visible}).findIndex(function(P){return P.data===s.data}),u=n.childNodes.item(v);$(u).html("");var E=Object.assign({},c,c?.userData,{adtData:e}),T=r.vcr.createEmbeddedView(f,E);r.renderer.appendChild(u,T.rootNodes[0])})},i.\u0275fac=function(t){return new(t||i)(o.Y36(o.SBq),o.Y36(o.s_b),o.Y36(o.Qsj))},i.\u0275dir=o.lG2({type:i,selectors:[["","datatable",""]],inputs:{dtOptions:"dtOptions",dtTrigger:"dtTrigger"}}),i}(),d=l(6814),m=function(){function i(){}return i.forRoot=function(){return{ngModule:i}},i.\u0275fac=function(t){return new(t||i)},i.\u0275mod=o.oAB({type:i}),i.\u0275inj=o.cJS({imports:[d.ez]}),i}()}}]);