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
const upvoteIcon = (<Icon name="thumb-up" size={width/16} color="grey" />);
const upvoteClickedIcon = (<Icon name="thumb-up" size={width/16} color="yellow" />);
const downvoteIcon = (<Icon name="thumb-down" size={width/16} color="grey" />);
const downvoteClickIcon = (<Icon name="thumb-down" size={width/16} color="yellow" />);
const closeIcon = (<Icon name="close" size={width/16} color="black" />);
const addImgIcon = (<Icon name="camera-alt" size={width/12} color="black" />);

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
               height: height * 0.1,
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
          return <View style={[styles.postTypeIcon, {backgroundColor: 'grey'}]} />
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
                             {backgroundColor: 'black',
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
    let SubmitBtn = MKButton.coloredButton().withText('留言')
              .withOnPress(() => 
                      {this.notice('留言提交成功 : )');
                       this.setState({openForm: false})})
              .build();
    if (!this.state.openForm) return <View />;
    return (
        <Modal
         animationType={"none"}
         transparent={true}
         visible={true}
         >
        <View style={{width: width * 0.96, height: height * 0.5, marginBottom: height*0.4, marginTop: height * 0.03, borderRadius: 5,
            left: width * 0.02, 
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 0},
    backgroundColor: '#E8E8E8',
        }}>
        <ScrollView>
	      <TouchableHighlight underlayColor='transparent' onPress={()=>{this.setState({openForm: false})}}>
              {closeIcon}
          </TouchableHighlight>
        <View flexDirection='row' padding={width * 0.02}  >
        <Text style={{fontSize: width * 0.04, padding: width * 0.04}}>留言类型:</Text>
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
       style={{width: width * 0.94, height: height * 0.15, top: height* 0.01, left: width * 0.01, borderColor: 'gray', 
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 0},
    backgroundColor: '#F8F8FF',
          borderRadius: 5}}
          placeholder='留言最多100字'
          onChangeText={(post) => this.setState({post})}
          //defaultValue={this.state.post}
          defaultValue='啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
              fontSize={width*0.04}
         />
          <View padding={height* 0.03} flexDirection='row'>
	      <TouchableHighlight 
           underlayColor='transparent' 
           onPress={()=>{
               var options = {
                   quality: 1.0,
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
              {this.showSelectedPic()}
              {this.showModal()}
             </View>
             <View style={{alignItems: 'center', marginLeft: 7, marginRight: 7}} >
             < SubmitBtn />
             </View>
             </ScrollView>
          </View>
         </Modal>
    )
  }

  showModal() {
    let pic = this.state.modalPic;
    if (pic === '')  return <View />;
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

  renderCard() {
      if (!this.state.postOpen) return <View></View>
      return (
        <Card styles={{card: {width: width * 0.96, marginBottom: height*0.4, marginTop: height * 0.03, borderRadius: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 0},
    backgroundColor: '#E8E8E8',
        }}}>
          <CardContent>
	      <TouchableHighlight underlayColor='transparent' onPress={()=>{this.setState({postOpen: false})}}>
              {closeIcon}
          </TouchableHighlight>
          <View style={{height: 2, backgroundColor: 'grey', }} />
              <Text style={{fontSize: width * 0.035, color:'grey'}}>2017.10.1:</Text>
              <Text style={{fontSize: width * 0.04}}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Mauris sagittis pellentesque lacus eleifend lacinia...
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Mauris sagittis pellentesque lacus eleifend lacinia...
              </Text>
          </CardContent>
          <CardImage>
	          <TouchableHighlight underlayColor='transparent' onPress={()=>{this.setState({modalPic: URI})}}>
              <Image
               style={{
               resizeMode: "contain",
               width: width * 0.96,
               height: height * 0.25,
               }}
               source={{ uri: URI }} />
               </TouchableHighlight>
              <View style={{flex:1, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 5}}>
                <View style={{flexDirection: 'row'}}>
	              <TouchableHighlight underlayColor='transparent' onPress={()=>{this.notice('upvote pressed'); console.log('pressed')}}>
                    {upvoteIcon}
                  </TouchableHighlight>
                  <Text style={{backgroundColor:'transparent', color:"#FA8072", padding: width*0.01}}>200    </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
	              <TouchableHighlight underlayColor='transparent' onPress={()=>console.log('pressed')}>
                  {downvoteIcon}
                  </TouchableHighlight>
                  <Text style={{backgroundColor:'transparent', padding: width*0.01, color:"#008B00"}}>200    </Text>
                </View>
	            <TouchableHighlight underlayColor='transparent' onPress={()=>console.log('pressed')}>
                  <Text style={{color: '#EE3B3B'}}>举报</Text>
                </TouchableHighlight>
              </View>
          </CardImage>
        </Card>
      )
  }

  render() {
      console.log('render:');
      console.log(this.state.selectedType);
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
	  <View>{refreshIcon}</View>
	</TouchableHighlight >
	<TouchableHighlight style={styles.addButton}
	 underlayColor='#ff7043' onPress={()=>{
             this.setState({openForm: !this.state.openForm});
             }} >
	  <View>{addIcon}</View>
	</TouchableHighlight>
        </View>
        { this.renderCard() }
        { this.showNotice() }
        { this.showForm() }
        { this.renderSpinner() }
        { this.showModal() }
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
  searchButton: {
    backgroundColor: 'lightblue',
    borderColor: 'lightblue',
    borderWidth: 1,
    height: width/13,
    width: width/13,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height / 1.32,
    right: width / 24,
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

  postTypeIcon: {
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    height: width/8,
    width: width/8,
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
        height: height * 0.185,
        backgroundColor: 'black',
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
        marginLeft: 3,
        width: 30,
        height: 30,
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
