
 package main
 import (
         "bytes"
         "encoding/json"
         "fmt"
         "strconv"
         "time"
         "github.com/hyperledger/fabric/core/chaincode/shim"
         sc "github.com/hyperledger/fabric/protos/peer"
 )
 
 type SmartContract struct {
 }

 type Registration struct {
        RegistrationDate   string `json:registrationDate` 
        Validity   string `json:validty`
        vin string  `json:vin`
        RegistrationNumber string `json:registrationNumber`
        GDT string `json:GDT`
}


 type Car struct {
         Make   string `json:"make"`
         Model  string `json:"model"`
         Color  string `json:"color"`
         borders     string `json:borders`
         img     string `json:img`
         vin string  `json:vin`   
 }
 
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
         return shim.Success(nil)
 }
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
 
        function, args := APIstub.GetFunctionAndParameters()
        if function == "createca" {
                 return s.createca(APIstub, args)
         } else if function == "createci" {
                 return s.createci(APIstub, args)
         } else if function == "queryall" {
                 return s.queryall(APIstub,args)
         } else if function == "updateca" {
                 return s.updateca(APIstub, args)
         } else if function == "createde" {
                return s.createde(APIstub, args)
         } else if function == "removeca" {
                return s.removeca(APIstub, args)
         }
         
         return shim.Error("Invalid Smart Contract function name.")
 }
 
 func (s *SmartContract) queryCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
         if len(args) != 1 {
                 return shim.Error("Incorrect number of arguments. Expecting 1")
         }
         var vin= args[0]
         carAsBytes, _ := APIstub.GetState(vin)
         return shim.Success(carAsBytes)
 }
  
 func (s *SmartContract) createci(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
         if len(args) != 5 {
                 return shim.Error("Incorrect number of arguments. Expecting 5")
         }
 
         fmt.Printf("- start createci for : %s\n", args[0])

         var car = Car{Make: args[1], Model: args[2], Color: args[3], vin: args[4], img: args[5]}
 
         carAsBytes, _ := json.Marshal(car)
         APIstub.PutState(args[0], carAsBytes)
 
         return shim.Success(nil)
 }
 

 func (s *SmartContract) createca(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
        if len(args) != 5 {
                return shim.Error("Incorrect number of arguments. Expecting 6")
        }

        var registration = Registration{RegistrationDate: args[1], vin: args[2], Validity: args[3]}

        registrationAsBytes, _ := json.Marshal(registration)
        APIstub.PutState(args[0], registrationAsBytes)

        return shim.Success(nil)
}

 

func (s *SmartContract) queryall(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
        if len(args) < 1 {
            return shim.Error("Incorrect number of arguments. Expecting 1")
        }
        registrtionNumber := args[0]
    
        fmt.Printf("- start queryall for : %s\n", registrtionNumber)
    
        resultsIterator, err := APIstub.GetHistoryForKey(registrtionNumber)
        if err != nil {
            return shim.Error(err.Error())
        }
        defer resultsIterator.Close()
    
        var buffer bytes.Buffer
        buffer.WriteString("[")
    
        bArrayMemberAlreadyWritten := false
        for resultsIterator.HasNext() {
            response, err := resultsIterator.Next()
            if err != nil {
                return shim.Error(err.Error())
            }
            if bArrayMemberAlreadyWritten == true {
                buffer.WriteString(",")
            }
            buffer.WriteString("{\"TxId\":")
            buffer.WriteString("\"")
            buffer.WriteString(response.TxId)
            buffer.WriteString("\"")
    
            buffer.WriteString(", \"Value\":")
            if response.IsDelete {
                buffer.WriteString("null")
            } else {
                buffer.WriteString(string(response.Value))
            }
    
            buffer.WriteString(", \"Timestamp\":")
            buffer.WriteString("\"")
            buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
            buffer.WriteString("\"")
    
            buffer.WriteString(", \"IsDelete\":")
            buffer.WriteString("\"")
            buffer.WriteString(strconv.FormatBool(response.IsDelete))
            buffer.WriteString("\"")
            buffer.WriteString("}")
            bArrayMemberAlreadyWritten = true
        }
        buffer.WriteString("]")
    
        fmt.Printf("- queryall returning:\n%s\n", buffer.String())
    
        return shim.Success(buffer.Bytes())
    
    }




    func (s *SmartContract) createde(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
        if len(args) != 1 {
                return shim.Error("Incorrect number of arguments. Expecting 2")
        }

        carAsBytes, _ := APIstub.GetState(args[0])
        return shim.Success(carAsBytes)
}

func (s *SmartContract) removeca(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
        var jsonResp string
        var registrationJson Registration
        if len(args) != 1 {
            return shim.Error("Incorrect number of arguments. Expecting 1")
        }
        registrationNumber := args[0]
        valAsbytes, err := APIstub.GetState(registrationNumber) 
        if err != nil {
            jsonResp = "{\"Error\":\"Failed to get state for " + registrationNumber + "\"}"
            return shim.Error(jsonResp)
        } else if valAsbytes == nil {
            jsonResp = "{\"Error\":\"registration does not exist: " + registrationNumber + "\"}"
            return shim.Error(jsonResp)
        }
        err = json.Unmarshal([]byte(valAsbytes), &registrationJson)
        if err != nil {
            jsonResp = "{\"Error\":\"Failed to decode JSON of: " + registrationNumber + "\"}"
            return shim.Error(jsonResp)
        }
    
        err = APIstub.DelState(registrationNumber) 
        if registrationJson.vin != ""  {
                err = APIstub.DelState(registrationJson.vin) 
        }

        if err != nil {
            return shim.Error("Failed to delete state:" + err.Error())
        }
        return shim.Success(nil)
    }




 func (s *SmartContract) updateca(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
         if len(args) != 2 {
                 return shim.Error("Incorrect number of arguments. Expecting 2")
         }
 
         registrationAsBytes, _ := APIstub.GetState(args[0])
         registration := Registration{}
 
         json.Unmarshal(registrationAsBytes, &registration)
         registration.GDT = args[1]
 
         registrationAsBytes, _ = json.Marshal(registration)
         APIstub.PutState(args[0], registrationAsBytes)
 
         return shim.Success(nil)
 }
 