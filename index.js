const fs = require("fs");
const request = require('request');
const vkAuth = require('vk-auth')(6334949, 589842);
const uuidV4 = require('uuid/v4');
const crypto = require('crypto');
const utf8 = require('utf8');
const urlParse = require("url");
const qs = require('qs');
const bodyParser = require('body-parser');
const defaults = require("defaults");
const image2base64 = require('image-to-base64');


	  Array.prototype.max = function() {
	    return this.indexOf(Math.max.apply(null, this));
	  };

	  Array.prototype.min = function() {
	    return this.indexOf(Math.min.apply(null, this));
	  };

	    const getToken = (log, pass) => {

		    return new Promise((resolve, reject) => {

		      vkAuth.authorize(log, pass, function(err, tokenParams) {
		        
		        if(!err) {

		          return resolve(tokenParams)

		        } else return reject(err)

		      });

		    })

		 }

		  const sendRequest = (url, data) => {
		    var options = {
		      method: 'GET',
		      url: url,
		      qs: data,
		      headers: {
		        'User-Agent': utf8.encode("Клевер/2.3.3 (Redmi Note 4; Android 28; Scale/3.00; VK SDK 1.6.8; com.vk.quiz)")
		      }
		    }

		    return new Promise((resolve, reject) => {

		       request(options, (error, response, body) => {
		     
		          if(!error) {
		      
		            return resolve(body);

		          } else return reject(error);

		       })

		    })
		  }


		var cleverApi = function(options) {
		  options = defaults(options, {
		  	device_id:  uuidV4().replace(/-/g,"").substring(0,16),
		  	handlers: {},
		  	inGame: false,
		  	gameId: 0,
		  	endpoint: '',
		  	parametres: {},
			friendsAnswers: [0, 0, 0],
			lastAnswer: '',
			actions: {
			  WATCHED_GAME: 1,
			  JOIN_GAME: 2,
			  ANSWER_CORRECT: 3,
			  WIN_GAME: 4,
			  INVITE_FRIEND: 5,
			  COMMUNITY_NOTIFY: 6,
			},
			trueAnswer: 0,
			isLose: false,
			gameJoin: false,
			preGameData: {
				status: 'planned'
			},
			questionId: 0,
			lastQuestion: false,
			searchTime: 0,
			rightAnswers: 0,
			longpoll: true,
			video_owner_id: 0,
			video_id: 0,
			battleInvites: [],
			balance_clevers: 0
		  });


		  this.config = {
		  	login: options.login,
		  	password: options.password,
		  	device_id: options.device_id,
		  	handlers: options.handlers,
		  	inGame: options.inGame,
		  	gameId: options.gameId,
		  	endpoint: options.endpoint,
		  	parametres: options.parametres,
			friendsAnswers: options.friendsAnswers,
			lastAnswer: options.lastAnswer,
			actions: options.actions,
			trueAnswer: options.trueAnswer,
			isLose: options.isLose,
			gameJoin: options.gameJoin,
			preGameData: options.preGameData,
			lastQuestion: options.lastQuestion,
			questionId: options.questionId,
			searchTime: options.searchTime,
			rightAnswers: options.rightAnswers,
			longpoll: options.longpoll,
			battleInvites: options.battleInvite,
			balance_clevers: options.balance_clevers
		  };

		  return this;
		}

		cleverApi.prototype.login = function(accountID) {

			return new Promise((resolve, reject) => {
				getToken(this.config.login, this.config.password).then(tokenData => {

					this.config.token = tokenData.access_token;
					this.config.uid = tokenData.user_id;

					if(this.config.longpoll) this.WaitGame();
					
					if('auth' in this.config.handlers) {
						
						 this.notifyHandlers(true, this.config.handlers['auth']);

					}

					resolve(tokenData.user_id);


				}).catch(err => {

					reject('Ошибка при авторизации ' + err);

				});
			})
		}

		cleverApi.prototype.api1 = function(method, data) {

		    data.v = '5.96';
		    data.func_v = 9;
		    data.lang = 'ru';
		    data.https = 1;
    		data.access_token = this.config.token;

    		
    

		    var options = {
		      method: 'GET',
		      url: 'https://api.vk.com/method/execute.createComment?access_token='+data.access_token+'&v=5.96&unc_v=9&https=1&owner_id='+data.owner_id+'&video_id='+data.video_id+'&message='+data.message, //url: 'https://clever.fiftythreecorp.com/testq.json', 
		    }

		    return new Promise((resolve, reject) => {

		       request(options, (error, response, body) => {

		          if(!error) {

		            var data = JSON.parse(body);
		            
		            if(data.error) return reject(data.error);

		            return resolve(data.response);

		          } else return reject(error);

		       })

		    });
		}

		cleverApi.prototype.api = function(method, data, i) {

			//console.log('IIIIIII', i)
			if(i != 1) {
			    data.build_ver = 40031;
			    data.need_leaderboard = 0;
			    //data.func_v = 9;
			    //data.https = 1;
			    data.lang = 'ru';
			}
		    data.v = '5.96';

		    
    		data.access_token = this.config.token;

    		

		    var options = {
		      method: 'GET',
		      url: 'https://api.vk.com/method/' + method, //url: 'https://clever.fiftythreecorp.com/testq.json', 
		      qs: data
		    }

		    return new Promise((resolve, reject) => {

		       request(options, (error, response, body) => {

		          if(!error) {

		            var data = JSON.parse(body);
		            
		            if(data.error) return reject(data.error);

		            return resolve(data.response);

		          } else return reject(error);

		       })

		    });
		}

		cleverApi.prototype.testConfig = function(callback) {
			callback(this.config)
		}

		cleverApi.prototype.getHash = function(params) {

			var uid = this.config.uid;
			var device_id = this.config.device_id;

		    ids = '';
		    params.map(x => ids = ids + x);
		    ids = utf8.encode(ids + '3aUFMZGRCJ');
		    ids_hash = crypto.createHash('md5').update(ids).digest("hex");

		    user = utf8.encode((parseInt(uid) ^ 202520).toString());
		    user_hash = crypto.createHash('md5').update(user).digest("hex");

		    device = utf8.encode(device_id.toString() + '0MgLscD6R3');
		    device_hash = crypto.createHash('md5').update(device).digest("hex");

		    return ids_hash + '#' + user_hash + '#' + device_hash;

		}

		cleverApi.prototype.sendAction = function(actionID) {
		    var hash = this.getHash([actionID]);
		    var data = {action_id: actionID, hash: hash};

		    return new Promise((resolve, reject) => {

		      this.api('streamQuiz.trackAction', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		}

		cleverApi.prototype.getLongpoll = function(owner_id, video_id) {
		    
		    var data = {owner_id: owner_id, video_id: video_id}

		    return new Promise((resolve, reject) => {

		      this.api('video.getLongPollServer', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });

		}

		cleverApi.prototype.sendAnswer = function(coins_answer, game_id, answer_id, question_id) {
		    var hash = this.getHash([game_id, question_id]);
		    var data = {
		      answer_id: answer_id,
		      question_id: question_id,
		      device_id: this.config.device_id,
		      hash: hash
		    }

		    if(coins_answer) data.coins_answer = true;

		    return new Promise((resolve, reject) => {

		      this.api('streamQuiz.sendAnswer', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    }); 
		}

		cleverApi.prototype.getGifts = function() {
		    return new Promise((resolve, reject) => {

		      this.api('execute.getGifts', {}).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		}

		cleverApi.prototype.purchaseGift = function(gift_id) {
		    var data = {gift_id: gift_id}

		    return new Promise((resolve, reject) => {

		      this.api('streamQuiz.purchaseGift', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    }); 
		}

		cleverApi.prototype.useLife = function() {
		    return new Promise((resolve, reject) => {

		      this.api('streamQuiz.useExtraLif', {}).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		}

		cleverApi.prototype.getStartData = function() {
		    data = {
		      build_ver: 514034,
		      need_leaderboard: 0,
		      func_v: 11,
		      lang: 'ru',
		      https: 1
		    }
		    return new Promise((resolve, reject) => {

		      this.api('execute.getStartData', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		}

		cleverApi.prototype.WaitGame = function() {
		    this.getStartData().then(response => {

		    if('game_data' in this.config.handlers) {
		      this.notifyHandlers(response.game_info, this.config.handlers['game_data'])
		    }



		      var game = response.game_info.game;
		      var game_status = game.status;
		      this.config.preGameData = game;

		      if(game_status == 'started') {

		        this.startPolling(game)
		        

		      } else return setTimeout(this.WaitGame.bind(this), 5000);

		    }).catch(err => {

		      console.log(err)
		      return setTimeout(this.WaitGame.bind(this), 10000);

		    })
		}

		cleverApi.prototype.decodeEvent = function(gEvents) {

		    var events = [];
		    
			    for(event of gEvents) {
			      
			      events = [...events,  JSON.parse(event.split('<!>')[0])]
			    }

		    return events
		}

		cleverApi.prototype.getEvents = function() {
		    return new Promise((resolve, reject) => {

		    	
		      sendRequest(this.config.endpoint, this.config.parametres).then(res => {

		      	resParsed = JSON.parse(res);

		      	if(resParsed.filed) {
		      		return reject('err');
		      	}
		     	
		        if(resParsed.ts) {
		        	this.config.parametres.ts = resParsed.ts
		        }
		  
		        var events = this.decodeEvent(resParsed.events)
		        return resolve(events);

		      }).catch(err => {

		        return reject('Ошибка getEvents: ' + err);

		      })

		    });
		}

		cleverApi.prototype.updateUrl = function(url) {
		    var parsedUrl = urlParse.parse(url['url']);
		    var query = parsedUrl.query;
		    this.config.parametres = qs.parse(query);
		    
		    this.config.endpoint = parsedUrl.protocol + '//' + parsedUrl.host + parsedUrl.pathname;
		}

		cleverApi.prototype.startPolling = function(game) {

		    this.config.inGame = true;
		    this.config.gameId = game.game_id;
		    this.config.video_owner_id = game.video_owner_id;
		    this.config.video_id = game.video_id;

		      this.getLongpoll(game.video_owner_id, game.video_id).then(url => {

		        this.updateUrl(url);
		        this.eventLoop();

		      }).catch(err => {

		        console.log(err);
		        setTimeout(this.WaitGame.bind(this), 1000);

		      });

		}

		cleverApi.prototype.eventLoop = function() {

		    if(this.config.inGame) {

		      this.getEvents().then(events => {

		        for(event of events) {
		          this.processEvent(event);
		        }

		        setTimeout(this.eventLoop.bind(this), 500);

		      }).catch(err => {

		        console.log('ERROR !', err);
		        setTimeout(this.eventLoop.bind(this), 1000);

		      })

		    }

		}

		cleverApi.prototype.processEvent = function(event) {
		    eventType = event.type;

		    if(eventType != 'video_comment_new') {
		      console.log('Новое уведомление:', eventType);
		    }

		    if(eventType == 'sq_question') {
		    	this.config.lastQuestion = {
		    		number: event.question.id,
		    		text: event.question.text,
		    		answers: event.question.answers,
		    		answerData: {
		    			searchTime: 'Поиск ответа..',
		    			friendAnswers: [0, 0, 0],
		    			percent: false,
		    			selectedAnswer: false,
		    			rightAnswer: false
		    		}
		    	};
		    	this.config.questionId = event.question.id;
		    }

		    if(eventType == 'sq_friend_answer') {

		    	this.config.lastQuestion.answerData.friendAnswers[event.answer_id]++;

		    }

		    if(eventType == 'sq_question_answers_right') {

		    	this.config.lastQuestion.answers = event.question.answers;

		    }

		    if(eventType == 'sq_ed_game') {
		    	this.clearGame();
		    	if(this.config.longpoll) this.WaitGame();
		    }

		    if(eventType in this.config.handlers) {

		      this.notifyHandlers(event, this.config.handlers[eventType])
		      
		    }

		    //if(!this.config.gameJoin) {

		     // console.log('входим в игру');
		     // this.gamejoin();

		    //}

		}

		cleverApi.prototype.gamejoin = function() {

			if(!this.config.gameJoin) {

				console.log('ACTION ID', this.config.actions.JOIN_GAME)
				this.sendAction(this.config.actions.JOIN_GAME).then(res => {

					this.config.gameJoin = true;
					console.log('Статус входа в игру:', res);

				}).catch(err => {

					console.log('Ошибка при входе в игру', err)
					this.config.gameJoin = true;

				})

		    }
		};

		cleverApi.prototype.comment = function(msg) {
			
			console.log(this.config.video_owner_id, this.config.video_id)

			var data = {
				owner_id: this.config.video_owner_id,
				video_id: this.config.video_id,
				message: msg
			}

		    return new Promise((resolve, reject) => {

		      this.api1('execute.createComment', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });	

		};

		cleverApi.prototype.bump = function(lat, lon) {

			var data = {
				lat: lat.toString(),
				lon: lon.toString(),
				access_token: this.config.token,
				v: 5.73,
				lang: 'ru',
				https: 1
			}

		    return new Promise((resolve, reject) => {

		      sendRequest('https://api.vk.com/method/execute.bump', data).then(res => {

		          return resolve(JSON.parse(res));

		      }).catch(err => {

		        return reject(err);

		      })

		    });
		};

		cleverApi.prototype.clearGame = function() {
		    this.config.gameId = 0;
		    this.config.inGame = false
		    this.config.gameJoin = false;
		    this.config.isLose = false;
		    this.config.parametres = {};
		    this.config.lastQuestion = false;
		    this.config.endpoint = '';
		}

		//BATLES 

		cleverApi.prototype.capResult = function(taskID, captcha_sid, callback) {

			it = this;

            var options = {
            	method: 'POST', url: 'https://api.anti-captcha.com/getTaskResult', json: true,
                body: { "clientKey": "ANTIGATEKEY", "taskId": taskID }
            }

            request(options, (error, response, body) => {

            	if(!error) {

            		var data = body;
            		if(data.errorId == 0) {

            			if(data.status == 'processing') {

            				console.log('processing...');
            				return setTimeout(() => {
            					it.capResult(taskID, captcha_sid, callback);
            				}, 5000)

            			} else {

          					//console.log('Разгадали капчу:', data);
          					console.log('Разгадали капчу:');
            				return callback(captcha_sid, data.solution.text);

            			}

            		} else {

	            		console.log('Ошибка при отправке getTaskResul', body, options);
	            		return it.pollRandomGame();

            		}

            	} else {

            		console.log('Ошибка при отправке getTaskResul', error);
            		return it.pollRandomGame();

            	}

            });

		};

		cleverApi.prototype.capCreateTask = function(cap_base64, captcha_sid, callback) {

			it = this;
            var options = {
            	method: 'POST', url: 'https://api.anti-captcha.com/createTask', json: true,
                body: {
                	"clientKey": "ANTIGATEKEY",
                    "task": {"type": "ImageToTextTask", "body": cap_base64,"phrase": false, "case": false, "numeric": false,  "math": 0, "minLength": 0, "maxLength": 0},
                    "languagePool": "rn",
                }
            }

            request(options, (error, response, body) => {
            	if(!error) {
            		var data = body;
            		if(data.errorId == 0) {

            			it.capResult(data.taskId, captcha_sid, callback);
            			//console.log('Отправили запрос createTask', data);

            		} else {

            			console.log('Ошибка при отправке createTask', data, options);
            			return it.pollRandomGame();

            		}

            	} else {

            		console.log('Ошибка при отправке createTask', error);
            		return it.pollRandomGame();

            	}

            });
		};

		cleverApi.prototype.capNeeded = function(captcha_url, captcha_sid, callback) {
            
            it = this;
            image2base64(captcha_url).then((response) => {

            	this.capCreateTask(response, captcha_sid, callback);

            }).catch((error) => {
            	console.log('Ошибка получения base64 капчи из ВК', error);
    			it.pollRandomGame();
            })

		};

		cleverApi.prototype.pollRandomGame = function(captcha, captcha_key) {
			//console.log('SOL1', captcha, captcha_key)
			if(captcha === undefined) captcha = null;
            if(captcha_key === undefined) captcha_key = null;
            //console.log('SOL2', captcha, captcha_key)
            if(captcha !== null && captcha_key !== null) {
				data = {
					captcha_sid: encodeURIComponent(captcha).replace(/'/g, "%27").replace(/"/g, "%22"),
					captcha_key: captcha_key
				}
			} else {
				data = {}
			}
			it = this;

		      this.api('execute.pollRandomGame', data).then(res => {
		      	//console.log(res)
		      	if(res == 1) {
		      		//console.log("RES 1")
		      		setTimeout(() => {
		      			this.pollRandomGame();
		      		}, 1000);
		      	} else {
			      	this.anytimeStartGame(res, 1).then(g => {
			      		
						this.anytimeGetNextQuestion(g.id, 1);
				      	if('battle_start' in this.config.handlers) {
				      		this.notifyHandlers(g, this.config.handlers['battle_start'])
				      	}

			      	}).catch(e => {

			      		if(e.error_code == 2214) {
			      			this.stopFantomBattle().then(r => {
			      				this.pollRandomGame();
				      		}).catch(e => {
				      				this.pollRandomGame();
				      		})
			      		return;
			      		}
			      		setTimeout(() => {
			      			this.pollRandomGame();
			      		}, 1000);
			      		if('battle_error' in this.config.handlers) {
			      			this.notifyHandlers(e, this.config.handlers['battle_error'])
			      		}
			      	})

		      	}

		      }).catch(err => {
		      	if('battle_error' in this.config.handlers) {
		      		this.notifyHandlers(err, this.config.handlers['battle_error'])
		      	}
		      	if(err.error_code == 2214) {
		      		this.stopFantomBattle().then(r => {
		      			this.pollRandomGame();
		      		}).catch(e => {
		      			this.pollRandomGame();
		      		})
		      		return;
		      	} else if(err.error_code == 14) {
		      		
		      		console.log('captcha err')
  					this.capNeeded(err.captcha_img, err.captcha_sid, (captcha_1, captcha_key_1) => {
		      			//console.log('SOLUTION', captcha_1, captcha_key_1)
		      			setTimeout(() => {
		      				this.pollRandomGame(captcha_1, captcha_key_1)
		      			}, 2000);
		      			
		      		})
		      		return;
		      	} else {

		      		setTimeout(() => {
		      			this.pollRandomGame();
		      		}, 1000);

		      	}

		      })
		};

		cleverApi.prototype.stopFantomBattle = function() {
			data = {
				device_id: this.config.device_id
			}
		    return new Promise((resolve, reject) => {

		      this.api('execute.stopFantomBattle', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		};

		cleverApi.prototype.anytimeStartGame = function(gameID, is_realtime) {
			data = {
				is_realtime: is_realtime,
				game_id: gameID,
				device_id: this.config.device_id
			}
		    return new Promise((resolve, reject) => {

		      this.api('streamQuiz.anytimeStartGame', data, 1).then(res => {
		      	 //console.log('start g', res)
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		};

		cleverApi.prototype.getBattleGameState = function() {
			data = {
				device_id: this.config.device_id
			}
		    return new Promise((resolve, reject) => {

		      this.api('execute.getBattleGameState', data).then(res => {
		          return resolve(res);
		      }).catch(err => {
		        reject(err);
		      })

		    });
		};

		cleverApi.prototype.anytimeGetNextQuestion = function(gameID, is_realtime, captcha, captcha_key) {
			this.config.is_realtime = is_realtime;
			data = {
				game_id: gameID,
				is_realtime: this.config.is_realtime
			}
			if(captcha === undefined) captcha = null;
            if(captcha_key === undefined) captcha_key = null;
            //console.log('SOL2', captcha, captcha_key)
            if(captcha !== null && captcha_key !== null) {
				data.captcha_sid = encodeURIComponent(captcha).replace(/'/g, "%27").replace(/"/g, "%22");
				data.captcha_key = captcha_key;
			}

		      this.api('streamQuiz.anytimeGetNextQuestion', data, 1).then(res => {

		      	if('battle_question' in this.config.handlers) {
		      		res.gameID = gameID;
			    	this.notifyHandlers(res, this.config.handlers['battle_question'])
			    }


		      }).catch(err => {

		      	
		      	if(err.error_code == 2203) {

		      		return setTimeout(() => {
		      			this.anytimeGetNextQuestion(gameID, this.config.is_realtime);
		      		}, 1000);
		      	} else if(err.error_code == 2204) {
		      		console.log('next q timeout')
		      		return this.finishGame(gameID);
		      	} else if(err.error_code == 2206) {
		      		console.log('next q game is not active')
		      		return this.pollRandomGame();
		      	} else if(err.error_code == 14) {

		      		console.log('captcha err')
  					this.capNeeded(err.captcha_img, err.captcha_sid, (captcha_1, captcha_key_1) => {
		      			//console.log('SOLUTION', captcha_1, captcha_key_1)
		      			setTimeout(() => {
		      				this.anytimeGetNextQuestion(gameID,  this.config.is_realtime, captcha_1, captcha_key_1)
		      			}, 2000);
		      			
		      		})
		      		return;

		      	}
		      	if('battle_error' in this.config.handlers) {
		      		this.notifyHandlers(err, this.config.handlers['battle_error'])
		      	}
		      	console.log('Ошибка при получении вопроса', err);
		      	return this.pollRandomGame();

		      })
		};

		cleverApi.prototype.anytimeSendAnswer = function(gameID, question_ind, answerID) {
			data = {
				game_id: gameID,
				question_ind: question_ind,
				answer_id: answerID
			}

		      this.api('streamQuiz.anytimeSendAnswer', data).then(res => {
		       
		      	//console.log('Отправили ответ', res, answerID);
		      	this.anytimeCheckAnswer(gameID);

		      }).catch(err => {

		      	console.log('Ошибка при отправке ответа', err);
		      	return this.pollRandomGame();

		      })
		};

		cleverApi.prototype.anytimeCheckAnswer = function(gameID) {

		      this.api('streamQuiz.anytimeCheckAnswer', data).then(res => {
		         
		        // console.log('проверили ответ:', res);
			      	if('battle_answer' in this.config.handlers) {

				    	this.notifyHandlers(res.right_answer_id, this.config.handlers['battle_answer'])
				    }
				    if(!res.is_last) {
				    	this.anytimeGetNextQuestion(gameID, this.config.is_realtime)
				    } else {
				    	//console.log('END', res)
				    			if('battle_end' in this.config.handlers) {
				    				res.cbalance = this.config.balance_clevers;
				    				this.notifyHandlers(res, this.config.handlers['battle_end'])
							    }
				    	this.finishGame(gameID);
				    }

		      }).catch(err => {

		      	
		      	if(err.error_code == 2203) {
		      		setTimeout(() => {
		      			this.anytimeCheckAnswer(gameID);
		      		}, 750);
		      	} else if(err.error_code == 2206) {
		      		setTimeout(() => {
		      		return this.pollRandomGame();
		      		}, 1000);
		      	} else {
		      		console.log('Ошибка при проверке ответа:', err);
		      		return this.pollRandomGame();
		      	}

		      })

		};

		cleverApi.prototype.finishGame = function(gameID) {

			data = {
				func_v: 2,
				game_id: gameID,
				device_id: this.config.device_id
			}

		      this.api('execute.finishGame', data).then(res => {
		         
		      	if(res.finish !== false) {
		      		//console.log('FINISH', res)
		      		return this.getInvites();
		      	} else {
		      		setTimeout(() => {
		      			this.finishGame(gameID);
		      		}, 1000);
		      	}

		      }).catch(err => {

		      	console.log('Ошибка при завершении игры:', err);
		      	setTimeout(() => {
		      		this.finishGame(gameID);
		      	}, 1000);

		      })

		};

		cleverApi.prototype.cancelInvition = function(gameID) {
			
			var data = {
				game_id: gameID
			}


		    this.api('streamQuiz.anytimeCancelInvitation', data).then(res => {
		         
		      	if(res == 1) {
		      		console.log('Отменили игру #', gameID);
		      		setTimeout(() => {
		      			this.checkInvites();
		      		}, 2000)
		      		
		      	} else {
		      		console.log('Ошибка при отмене игры #', gameID, res);
		      		this.checkInvites();
		      	}

		    }).catch(err => {

		      	console.log('Ошибка [1] при отмене игры #', gameID, err);
		      	setTimeout(() => {
		      		this.checkInvites();
		      	}, 1000);

		    })

		};

		cleverApi.prototype.checkInvites = function() {
			
			if(this.config.battleInvites.length > 0) {

				var battle = this.config.battleInvites.shift();
				if(battle.bet == 0) {
					this.cancelInvition(battle.id);
				} else {

					console.log('Начинаем игру по приглашению:')
			      	this.anytimeStartGame(battle.id, 0).then(g => {
			      		console.log('Начинаем игру по приглашению g:', g)
			      		
						this.anytimeGetNextQuestion(g.id, 0);
				      	if('battle_start' in this.config.handlers) {
				      		this.notifyHandlers(g, this.config.handlers['battle_start'])
				      	}

			      	}).catch(e => {
			      		console.log('Начинаем игру по приглашению e:', e)
			      		if(e.error_code == 2214) {
			      			this.stopFantomBattle().then(r => {
			      				this.pollRandomGame();
				      		}).catch(e => {
				      				this.pollRandomGame();
				      		})
			      		return;
			      		} else if(e.error_code == 8)
			      		setTimeout(() => {
			      			this.pollRandomGame();
			      		}, 1000);
			      		if('battle_error' in this.config.handlers) {
			      			this.notifyHandlers(e, this.config.handlers['battle_error'])
			      		}
			      	})

				}


			} else {

				console.log('Закончили проверять приглашения.')
				this.pollRandomGame();

			}

		};

		cleverApi.prototype.getInvites = function() {
			this.getStartData().then(res => {
				console.log('Баланс:', res.game_info.user.coins, 'клеверсов')
				this.config.balance_clevers = res.game_info.user.coins;
				if(res.battle_invites.inbound.length > 0) {

				 	this.config.battleInvites = res.battle_invites.inbound;
				 	console.log('Получили', res.battle_invites.inbound.length, 'приглашений в игру.')
				 	this.checkInvites();

				} else {

					console.log('Нет активных приглашений.')
					setTimeout(() => {

						this.pollRandomGame();					

					}, 2000);

				}

			}).catch(err => {

				console.log('Ошибка при получении активных приглашений.')
				setTimeout(() => {

					this.pollRandomGame();					

				}, 2000);
			})
		};

		cleverApi.prototype.notifyHandlers = function(event, handler) {
		   	handler(event, this.config);
		}

		cleverApi.prototype.on = function(event_type, func) {
		    this.config.handlers[event_type] = func;
		}

		cleverApi.prototype.setConfig = function(key, value) {
			this.config[key] = value;
		}


		module.exports = cleverApi;