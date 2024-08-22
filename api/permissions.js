const emptyAdmin = { //[]-No Access, [1]-View, [2]-Add, [3]-Edit
    owners:[],
    // courses:[],
    // events:[],
    // students:[],
    // manufacturers:[],
    // faculty:[],
    // location:[],
    // attendance:[],
}
const emptyStudent = { //[]-No Access, [1]-View, [2]-Add, [3]-Edit
    // application:[],
    // attendance:[],
}
const emptyTemplates = [emptyAdmin,{},{},{},{},emptyStudent];
const typeArray = ["admin","","","","","student"];

module.exports = {
    calcPerms:function(type, strObj){  //get a type value and permission json string, parse into permissions object
        //console.log(strObj);
        var typeNum = 0;
        try{
            typeNum = parseInt(type, 10);
        } catch (error){
            return {
                type:-1,
                strType:"invalid",
                [strType]:{}
            }
        }
        if (typeNum < 0 || typeNum > 5){
            return {
                type:-1,
                strType:"invalid",
                [strType]:{}
            }
        }
        var strType = typeArray[typeNum];
        var perms = {};
        if (strObj.length === 0){
            perms = emptyTemplates[typeNum];
        } else {
            try{
                perms = JSON.parse(strObj);
            } catch (e){
                perms = emptyTemplates[typeNum];
            }
        }
        return {
            type:type,
            strType:typeArray[typeNum],
            [typeArray[typeNum]]:perms
        }
    },
    checkPerms:function(perms,required){
        var response = false;
        if (!required || required==undefined) return true;
        if (objectIsEmpty(required)){
            return true;
        }
        if (!perms) return response;
        if (objectIsEmpty(perms)){
            return response;
        }
        var role = perms.strType;
        //console.log("permissions",perms);
        //console.log("page requires",required);
        
        if (Array.isArray(required)){
            for (var c=0; c < required.length;c++){
                response = breakItDown(perms, required[c], response);
            }
        } else {
            response = breakItDown(perms, required, response);
        }
        return response;
    },
    RequiredPermissions:{
        None:[],
        ApplicationsView:[{admin:{applications:[1]}}],
        ApplicationsAndStudentsView:[{admin:{students:[1],attendance:[1]}}]
    }
}

function breakItDown(perms, required, response){
    try{
            for (var key in required){
                if (typeof(required[key]) =="object"){
                //loop through each base type required
                //console.log("loop through each base type required:", required[key]);
                if (key in perms){
                    //console.log("Key in perms:", (key));
                    if (typeof(required[key])=="object"){
                        var passing = 0;
                        var scored = 0;
                        //more properties to get
                        //console.log("more properties to get:",required[key]);
                        for (var key2 in required[key]){
                            if (typeof(required[key][key2])==="object"){
                                //loop through each required permission
                                //console.log("Loop through each req permissions:",required[key][key2]);
                                if (key2 in perms[key]){
                                    //Still alive and checks out so far. See just how much access.
                                    //console.log("Still here:",perms[key][key2]);
                                    var arrReq = required[key][key2];
                                    var arrPerms = perms[key][key2];
                                    passing = passing + arrReq.length;
                                    //var scored = 0;
                                    for (var a = 0; a < arrPerms.length; a++){
                                        for (var b = 0; b < arrReq.length; b++){
                                        //console.log("checking ",arrReq[b], " against ",arrPerms[a]);
                                        if (arrReq[b]==arrPerms[a]){
                                            scored++;
                                            //console.log("yes");
                                        }
                                        }
                                    }

                                }
                            }
                        }
                        if (passing > 0 && passing <= scored){
                            response = true;
                        }
                        //console.log("Passing:", passing , "Scored:",scored,"  Passed:", (passing <= scored));
                    }
                }
                }
            }
        } catch (error){
            console.log("Permission Check Error",error);
            return response;
        }
        return response;
}
function objectIsEmpty(obj){
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
/*Object.prototype.isEmpty = function() {
    for(var key in this) {
        if(this.hasOwnProperty(key))
            return false;
    }
    return true;
};*/