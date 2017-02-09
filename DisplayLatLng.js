import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Modal
} from 'react-native';

import ImagePicker from 'react-native-image-picker';

import Gallery from 'react-native-gallery';
import MapView from 'react-native-maps';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import TextField from 'react-native-md-textinput';
import {MKButton, MKSpinner, MKColor, MKIconToggle} from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    Card,
    CardImage,
    CardTitle,
    CardContent,
    CardAction
} from 'react-native-card-view';

const { width, height } = Dimensions.get('window');
const refreshIcon = (<Icon name="autorenew" size={width/12} color="black" />);
const addIcon = (<Icon name="create" size={width/12} color="white" />);
const person = (<Icon name="person" size={width/18} color="white" />);
const thumbup = (<Icon name="thumb-up" size={width/16} color="white" />);
const downvoteIcon = (<Icon name="exposure-neg-1" size={width/16} color="white" />);
const thumbdown = (<Icon name="thumb-down" size={width/16} color="white" />);
const deleteIcon = (<Icon name="delete-forever" size={width/14} color="white" />);
const closeIcon = (<Icon name="keyboard-arrow-left" size={width/16} color="white" />);
const addImgIcon = (<Icon name="camera-alt" size={width/18} color="white" />);

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.00102;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const PUBTYPE_GOODNEWS = 0;
const PUBTYPE_OTHERS = 1;
const HIDDENTYPE = 255;
const items = [{label: '福利留言', value:PUBTYPE_GOODNEWS},
               {label: '其它留言', value:PUBTYPE_OTHERS},
               {label: '隐藏留言 （靠近方能查看）', value:HIDDENTYPE}];
import ModalDropdown from 'react-native-modal-dropdown';


const URI = 'http://cdn.lolwot.com/wp-content/uploads/2015/07/20-pictures-of-animals-in-hats-to-brighten-up-your-day-1.jpg';
//let PicBed = 'http://up.imgapi.com?aid=1&from=web&httptype=2&deadline='
const PicBed = 'http://up.qiniu.com';

function generateUUID(){
    let d = new Date().getTime();
    let uuid = 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

class DisplayLatLng extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      post: '',
      selectedType: {label: '留言类型', value: null},
      selectedPic: '',
      modalPic: '',
      openForm: false,
      notice: [],
      postOpen: false,
      loading: true,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
    };
    this.getLocation();
//    setInterval(()=>this.getLocation(), 5000);
  }

  showSelectedPic() {
      if (this.state.selectedPic === '') return <View />
      return (
          <CardImage>
	          <TouchableHighlight underlayColor='transparent' onPress={()=>{this.setState({modalPic: this.state.selectedPic})}}>
              <Image
               style={{
               resizeMode: "contain",
               width: width * 0.6,
               height: height * 0.14,
               }}
               source={{ uri: this.state.selectedPic }} />
               </TouchableHighlight>
        </CardImage>
        )
  }

  notice(msg) {
      this.state.notice.push(msg); 
      this.setState({});
  }

  getPostTypeIcon() {
      if (this.state.selectedType.value === null)
          return <View style={[styles.postTypeIcon, {backgroundColor: '#D7CCC8'}]} />
      let icon;
      if (this.state.selectedType.value === PUBTYPE_GOODNEWS)
          icon = require('./images/doller-purple.png');
      if (this.state.selectedType.value === PUBTYPE_OTHERS)
          icon = require('./images/post-purple.png');
      if (this.state.selectedType.value === HIDDENTYPE)
          icon = require('./images/question-mark-purple.png');
      return (
	<View style={styles.postTypeIcon} >
        <Image style={styles.dropdown_2_image}
         mode='stretch'
         source={icon}/>
	</View >
      )
  }

  /*
  {"coords":{"speed":-1,"longitude":-0.1337,"latitude":51.50998,"accuracy":5,"heading":-1,"altitude":0,"altitudeAccuracy":-1},"timestamp":1486019032420.0698}
  */
  getLocation(onSuccess = (lat,lon)=>{
              this.setState({region: {latitude: lat,
                                      longitude: lon,
                                      latitudeDelta: LATITUDE_DELTA,
                                      longitudeDelta: LONGITUDE_DELTA}});},
              errMsg="无法获取当前位置信息！") {
      navigator.geolocation.getCurrentPosition(
          (loc) => {onSuccess(loc.coords.latitude, loc.coords.longitude);},
          (error) => { this.notice(errMsg) },
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000}
      );
  }

  _dropdown_renderRow(rowData, rowID, highlighted) {
      var icon;
      if (rowID === '0') icon = require('./images/doller-purple.png');
      if (rowID === '1') icon = require('./images/post-purple.png');
      if (rowID === '2') icon = require('./images/question-mark-purple.png');
      return (<TouchableHighlight underlayColor='white'>
                <View style={[styles.dropdown_2_row, 
                             {backgroundColor: '#424242',
                              borderRadius: 3
                             }]}>
                  <Image style={styles.dropdown_2_image}
                   mode='stretch'
                   source={icon}/>
                                
                  <Text style={[styles.dropdown_row_text, highlighted && {color: 'mediumaquamarine'}]}> 
                      {rowData.label} 
                  </Text> 
                </View>
              </TouchableHighlight>
             ); 
  }

  _dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
      if (rowID == items.length - 1) return;
      let key = `spr_${rowID}`;
      return (<View style={styles.dropdown_2_separator}
               key={key} />);
  }
  
  showForm() {
    if (!this.state.openForm) return <View />;
    return (
        <Modal
         animationType={"none"}
         transparent={true}
         visible={true}
         >
         {this.topbar()}
         <View style={{width: width, height: height * 0.6}} >
        <View style={{width: width * 0.86, height: height * 0.42, marginTop: height * 0.03, 
            left: width * 0.067, 
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 1},
    backgroundColor: '#EEEEEE',
        }}>
        <ScrollView>
        <View flexDirection='row' padding={width * 0.02}  >
        <Text style={{fontSize: width * 0.04, padding: width * 0.02}}>选择留言类型:</Text>
        <ModalDropdown 
         dropdownStyle={styles.dropdown_2_dropdown}
         options={items}
         renderRow={this._dropdown_renderRow.bind(this)}
         renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted)} 
         onSelect={(index, selectedType)=>{ this.setState({selectedType})}} >
	  {this.getPostTypeIcon()}
             </ModalDropdown>
                 </View>

      <TextInput label={'Name'} multiline = {true}  maxLength = {100} 
       style={{width: width * 0.84, height: height * 0.15, top: height* 0.03, left: width * 0.01, borderColor: 'gray', 
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 0},
    backgroundColor: '#F8F8FF',
          }}
          placeholder='留言最多100字'
          onChangeText={(post) => this.setState({post})}
          //defaultValue={this.state.post}
          defaultValue='啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
              fontSize={width*0.04}
         />
          <View padding={height* 0.05} flexDirection='row' justifyContent='flex-end'>
              {this.showSelectedPic()}
              {this.showModal()}
	      <TouchableHighlight 
           style={styles.cameraButton}
           underlayColor='transparent' 
           onPress={()=>{
               var options = {
                   quality: 0.5,
                   maxWidth: 500,
                   maxHeight: 500,
                   storageOptions: {
                       skipBackup: true }
               };
               ImagePicker.launchImageLibrary(options, (response)  => {

                   let body = new FormData();
                   let uuid = generateUUID();
                   this.setState({selectedPic: response.uri});
                   //body.append('file', 
                   //   {uri: response.uri, 
                   //    filename: response.fileName,
                   //    "Content-Type": 'image/jpg'});
                   //body.append('key', uuid+response.fileName);
                   //body.append('token', 'Y1I4Q1lhx-drrAGCSD2CGVIyyyprtKalKl1BJwiO:mLnWcFl_oG3xZWpQJy7PqUsIHqw=:eyJzY29wZSI6Im1ldGFtYXAiLCJkZWFkbGluZSI6MTQ4NjM5MzAzNn0=');
                   //fetch(PicBed,
                   //      {method: 'POST',
                   //       headers:{'Accept': 'application/json',
                   //                'Content-Type': 'multipart/form-data; boundary=----ThisIsUmaBoundaryWebKitFormBoundaryTC1z0EghC4FyYzRg'+uuid}, 
                   //       body: body})
                   //.then((res) => {console.log(res.status);res.json()})
                   //.then((res) => { console.log("response" +JSON.stringify(res)); })
                   //.catch((e) => console.log(e)).done()
               })
           }} >
              {addImgIcon}
          </TouchableHighlight>
             </View>
             </ScrollView>
          </View>
        {this.bottombar()}
          <View style={{
      position: 'absolute',
      left: width * 0.4,
      top: height * 0.453,}} >
           <TouchableHighlight
           underlayColor='transparent' 
           onPress={()=>{this.notice('留言提交成功 : )');
                       this.setState({openForm: false})}} >
          <Text style={{ textAlign: 'center', color:'white', fontSize: width * 0.05}}>地上留言</Text>
             </TouchableHighlight>
             </View>
          </View>
         </Modal>
    )
  }

  showModal() {
    let pic = this.state.modalPic;
    if (pic === '')  return <View />;
    console.log('render modal');
    return (
        <Modal
         animationType={"none"}
         transparent={true}
         visible={true}
         >
          <Gallery
           style={{flex: 1, backgroundColor: 'black'}}
           images={[this.state.modalPic]}
           onSingleTapConfirmed={()=>{this.setState({modalPic: ''})}}
           />
        </Modal>
    );
  }

  showNotice() {
      let len = this.state.notice.length;
      if (len === 0) { return <View></View> }
      let notice = this.state.notice[0];
      setTimeout(() => {this.state.notice.shift();this.setState(this.state.notice)}, 3000);
      return (
        <View style={[styles.bubble, styles.pos]}>
          <Text style={{ textAlign: 'center', color:'white'}}>
            {notice}
          </Text>
        </View>)
  }

  onRegionChange(region) {
      /*
    this.setState({ region });
    */
  }

  animateRandom() {
    this.map.animateToRegion(this.randomRegion());
  }

  randomRegion() {
    const { region } = this.state;
    return {
      ...this.state.region,
      latitude: region.latitude + ((Math.random() - 0.5) * (region.latitudeDelta / 2)),
      longitude: region.longitude + ((Math.random() - 0.5) * (region.longitudeDelta / 2)),
    };
  }

  renderSpinner() {
      if (this.state.loading) 
          return (<View style={styles.spinner}><MKSpinner /></View>)
      else return <View></View>
  }

  topbar() {
      return (
        <View style={{backgroundColor: '#EF5350', height: height * 0.035,
            left: width * 0.075,
            top: height * 0.03,
            width: width * 0.84,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 1}}}>
	      <TouchableHighlight underlayColor='transparent' padding={width*0.01} onPress={()=>{this.setState({postOpen: false})}}>
              {closeIcon}
          </TouchableHighlight>
              </View>
     );
  }

  bottombar() {
      return (
        <View style={{backgroundColor: '#3F51B5', height: height * 0.05,
            left: width * 0.055,
            top: height * 0.445,
            width: width * 0.88,
      position: 'absolute',
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 1}}} />
     );
  }

  renderCard() {
      if (!this.state.postOpen) return <View />
      return (
        <Modal
         animationType={"none"}
         transparent={true}
         visible={true} >
         <View style={{width: width, height: height}} >
         {this.topbar()}
        <View style={{width: width * 0.86, height: height * 0.38,  marginTop: height * 0.03, 
            left: width* 0.067,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 1},
    backgroundColor: '#EEEEEE',
        }}>
        <ScrollView>
              <Text style={{paddingHorizontal: width * 0.01, fontSize: width * 0.03, color:'grey'}}>有位小伙伴于2017.10.1在此处写道:</Text>
              <Text style={{padding: width * 0.02, fontSize: width * 0.04}}>
啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊
              </Text>
	          <TouchableHighlight underlayColor='transparent' onPress={()=>{this.setState({modalPic: URI})}}>
              <Image
               style={{
               resizeMode: "contain",
               width: width * 0.9,
               height: height * 0.22,
               }}
               source={{ uri: URI }} />
               </TouchableHighlight>
               </ScrollView>
        </View>
        {this.bottombar()}
               {this.renderButtons()}
              {this.showModal()}
               </View>
        </Modal>
      )
  }

  renderButtons() {
      if(!this.state.postOpen) return <View />;
      return (<View style={{width: width*0.84, flex:1, flexDirection: 'row', justifyContent: 'space-around', 
      position: 'absolute',
      top: height * 0.45,
      left: width * 0.07
      }}>
         <View flexDirection='row'>
	             <TouchableHighlight underlayColor='transparent' onPress={()=>{this.notice('upvote pressed'); console.log('pressed')}}>
           {thumbup}
                  </TouchableHighlight>
           <Text style={{backgroundColor:'transparent', color:"white", fontSize: width * 0.04, padding: width*0.01}}>200</Text>
         </View>
	       <TouchableHighlight onPress={()=>{this.notice('upvote pressed'); console.log('pressed')}}>
           {deleteIcon}
                  </TouchableHighlight>
         <View flexDirection='row'>
            <Text style={{backgroundColor:'transparent', padding: width*0.01, color:"white"}}>-200</Text>
	             <TouchableHighlight onPress={()=>{this.notice('upvote pressed'); console.log('pressed')}}>
            {thumbdown}
                  </TouchableHighlight>
         </View>
              </View>
      );
  }

  render() {
      console.log('render:');
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          ref={ref => { this.map = ref; }}
          style={styles.map}
	  mapType='standard'
	  showsUserLocation={true}
	  followsUserLocation={true}
          initialRegion={this.state.region}
          onRegionChange={region => this.onRegionChange(region)}
        >
            <MapView.Marker
              title="This is a title"
              description="This is a description"
              coordinate={{
        latitude: this.state.region.latitude+0.0003,
        longitude: this.state.region.longitude+0.0001
      }}
            >
	      <Image style={{width:width/22, height:height/24}} 
	             source={require('./images/question-mark-black.png')}/>
	    </MapView.Marker>
            <MapView.Marker
              title="This is a title"
              description="This is a description"
              coordinate={{
        latitude: this.state.region.latitude-0.0002,
        longitude: this.state.region.longitude-0.0004
      }}
            >
	      <Image style={{width:width/22, height:height/24}} 
	             source={require('./images/doller-red.png')}/>
                <MapView.Callout>
                <View>
	       <TouchableHighlight underlayColor='transparent' onPress={()=>{this.setState({postOpen: !this.state.postOpen})}}>
               <Text>open me</Text>
               </TouchableHighlight>
               </View>
                </MapView.Callout>
	    </MapView.Marker>
	</MapView>
	<View >
	<TouchableHighlight style={styles.refreshButton}
	 underlayColor='lightgrey' onPress={()=>{this.setState({loading: !this.state.loading});console.log('pressed')}}>
	  {refreshIcon}
	</TouchableHighlight >
	<TouchableHighlight style={styles.addButton}
	 underlayColor='#ff7043' onPress={()=>{
             this.setState({openForm: !this.state.openForm});
             }} >
	  {addIcon}
	</TouchableHighlight>
	<TouchableHighlight style={styles.personButton}
	 underlayColor='lightgrey' onPress={()=>{this.setState({loading: !this.state.loading});console.log('pressed')}}>
	  {person}
	</TouchableHighlight >
        </View>
        { this.renderCard() }
        { this.showNotice() }
        { this.showForm() }
        { this.renderSpinner() }
      </View>
    );
  }
}

DisplayLatLng.propTypes = {
  provider: MapView.ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    position: 'absolute',
    bottom: height * 0.7,
    left: width * 0.03,
    marginTop: 0,
    alignItems: 'stretch',
    padding: 20,
    width: width * 0.8,
    height: width / 2,
  },
  card1: {
    marginTop: 60,
    marginBottom: 60
  },
  cardtitle: {
    fontSize: width * 0.06,
    color: 'grey',
    backgroundColor: 'white'
    },
  pos: {
    position: 'absolute',
    bottom: height * 0.2,
    right: width / 12,
    width: width / 1.2,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: 'grey',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  searchBar: {
    bottom: height / 1.35,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 2,
    right: width / 2.2,
  },
  toggle: {
    position: 'absolute',
    bottom: height / 1.11,
    left: width/1.18,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  addButton: {
    backgroundColor: '#EE4000',
    borderColor: '#EE4000',
    borderWidth: 1,
    height: width/8,
    width: width/8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 28,
    right: width / 24,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 2,
      width: 0}
  },
  personButton: {
    backgroundColor: 'black',
    borderColor: 'black',
    borderWidth: 1,
    height: width/13,
    width: width/13,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 1.15,
    right: width / 25,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0}
  },
  transButton: {
    backgroundColor: 'lightgreen',
    borderColor: 'lightgreen',
    borderWidth: 1,
    height: width/13,
    width: width/13,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 1.1,
    left: width / 24,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0}
  },
  faviButton: {
    backgroundColor: 'lightgrey',
    borderColor: 'lightgrey',
    borderWidth: 1,
    height: width/13,
    width: width/13,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 1.82,
    right: width / 24,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0}
  },
  cameraButton: {
    backgroundColor: '#e4a800',
    borderColor: '#e4a800',
    borderWidth: 1,
    height: width/12,
    width: width/12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0}
  },

  refreshButton: {
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    height: width/8,
    width: width/8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 28,
    left: width / 24,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 2,
      width: 0}
  },

  upButton: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
    borderWidth: 1,
    height: width/8,
    width: width/8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 2,
      width: 0}
  },
  downButton: {
    backgroundColor: '#607D8B',
    borderColor: '#607D8B',
    borderWidth: 1,
    height: width/8,
    width: width/8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 2,
      width: 0}
  },
  postTypeIcon: {
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    height: width/9,
    width: width/9,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: height * 0.005,
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
      width: 0}
  },



    dropdown: {
        alignSelf: 'flex-start',
        width: width * 0.5,
        top: 32,
        right: 8,
        borderWidth: 0,
        borderRadius: 3,
        backgroundColor: 'cornflowerblue',
    },
    dropdown_2_text: {
        marginVertical: 10,
        marginHorizontal: 6,
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    dropdown_2_dropdown: {
        width: width * 0.6,
        height: height * 0.21,
        backgroundColor: '#424242',
        borderColor: 'grey',
        borderRadius: width * 0.01,
    shadowColor: "#000000",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 2,
      width: 0}
    },
    dropdown_2_row: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
    },
    dropdown_2_image: {
        padding: width*0.02,
        width: width* 0.035,
        height: height * 0.035,
    },
    dropdown_row_text: {
        fontSize: width * 0.04,
        color: 'white',
        textAlignVertical: 'center',
    },
    dropdown_2_separator: {
        height: 1,
        backgroundColor: 'grey',
    },
});

module.exports = DisplayLatLng;
